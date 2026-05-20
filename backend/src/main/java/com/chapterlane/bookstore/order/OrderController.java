package com.chapterlane.bookstore.order;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.chapterlane.bookstore.book.Book;
import com.chapterlane.bookstore.book.BookRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private static final double TAX_RATE = 0.0825;

  private final BookRepository bookRepository;
  private final OrderRepository orderRepository;

  public OrderController(BookRepository bookRepository, OrderRepository orderRepository) {
    this.bookRepository = bookRepository;
    this.orderRepository = orderRepository;
  }

  @GetMapping
  @Transactional(readOnly = true)
  public List<OrderResponse> listOrders() {
    return orderRepository.findAll().stream()
        .sorted(Comparator.comparing(StoreOrder::getCreatedAt).reversed())
        .map(OrderResponse::from)
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Transactional
  public StoreOrder createOrder(@Valid @RequestBody OrderRequest request) {
    double subtotal = 0;

    for (OrderRequest.OrderItemRequest item : request.items()) {
      Book book = bookRepository.findById(item.bookId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book not found: " + item.bookId()));
      if (!book.isPublished()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Book is not available: " + book.getTitle());
      }
      if (book.getStock() < item.quantity()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough stock for: " + book.getTitle());
      }
      subtotal += book.getPrice() * item.quantity();
    }

    double tax = subtotal * TAX_RATE;
    StoreOrder order = new StoreOrder(
        request.customerName(),
        request.customerEmail(),
        request.deliveryOption(),
        subtotal,
        tax,
        subtotal + tax);

    for (OrderRequest.OrderItemRequest item : request.items()) {
      Book book = bookRepository.findById(item.bookId()).orElseThrow();
      book.setStock(book.getStock() - item.quantity());
      order.addLine(book.getId(), book.getTitle(), item.quantity(), book.getPrice());
    }

    return orderRepository.save(order);
  }
}

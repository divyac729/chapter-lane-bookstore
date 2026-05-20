package com.chapterlane.bookstore.order;

import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    String customerName,
    String customerEmail,
    String deliveryOption,
    double subtotal,
    double tax,
    double total,
    Instant createdAt,
    List<OrderLineResponse> lines) {
  public static OrderResponse from(StoreOrder order) {
    return new OrderResponse(
        order.getId(),
        order.getCustomerName(),
        order.getCustomerEmail(),
        order.getDeliveryOption(),
        order.getSubtotal(),
        order.getTax(),
        order.getTotal(),
        order.getCreatedAt(),
        order.getLines().stream().map(OrderLineResponse::from).toList());
  }

  public record OrderLineResponse(
      Long id,
      String bookId,
      String title,
      int quantity,
      double unitPrice) {
    public static OrderLineResponse from(OrderLine line) {
      return new OrderLineResponse(
          line.getId(),
          line.getBookId(),
          line.getTitle(),
          line.getQuantity(),
          line.getUnitPrice());
    }
  }
}

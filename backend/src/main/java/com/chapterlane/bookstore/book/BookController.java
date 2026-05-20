package com.chapterlane.bookstore.book;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/books")
public class BookController {
  private final BookRepository bookRepository;
  private final CatalogSeeder catalogSeeder;

  public BookController(BookRepository bookRepository, CatalogSeeder catalogSeeder) {
    this.bookRepository = bookRepository;
    this.catalogSeeder = catalogSeeder;
  }

  @GetMapping
  public List<Book> listBooks() {
    return bookRepository.findAll().stream()
        .sorted(Comparator.comparing(Book::getId))
        .toList();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Book createBook(@Valid @RequestBody Book book) {
    if (book.getId() == null || book.getId().isBlank()) {
      book.setId("bk-" + UUID.randomUUID());
    }
    if (bookRepository.existsById(book.getId())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "A book with that ID already exists.");
    }
    return bookRepository.save(book);
  }

  @PutMapping("/{id}")
  public Book updateBook(@PathVariable String id, @Valid @RequestBody Book book) {
    if (!bookRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found.");
    }
    book.setId(id);
    return bookRepository.save(book);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteBook(@PathVariable String id) {
    bookRepository.deleteById(id);
  }

  @PostMapping("/reset")
  public List<Book> resetCatalog() {
    catalogSeeder.resetCatalog();
    return listBooks();
  }
}

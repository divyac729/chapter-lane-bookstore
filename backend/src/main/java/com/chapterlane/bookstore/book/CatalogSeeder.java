package com.chapterlane.bookstore.book;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CatalogSeeder implements CommandLineRunner {
  private final BookRepository bookRepository;

  public CatalogSeeder(BookRepository bookRepository) {
    this.bookRepository = bookRepository;
  }

  @Override
  public void run(String... args) {
    if (bookRepository.count() == 0) {
      resetCatalog();
    }
  }

  public void resetCatalog() {
    bookRepository.deleteAll();
    bookRepository.saveAll(seedBooks());
  }

  public List<Book> seedBooks() {
    return List.of(
        new Book("bk-101", "Designing Calm Systems", "Mira Patel", "Design", 34.99, 4.8, 12,
            "A practical guide to building interfaces that feel focused, legible, and humane.", "cover-sage", true),
        new Book("bk-102", "Modern Java Notes", "Theo Brooks", "Engineering", 42, 4.7, 9,
            "Concise patterns for services, APIs, testing, and production-ready Java applications.", "cover-rust", true),
        new Book("bk-103", "The Product Reader", "Leah Morgan", "Business", 28.5, 4.5, 15,
            "Case studies and decision frameworks for shipping useful digital products.", "cover-ink", true),
        new Book("bk-104", "Data Stories at Work", "Nolan Kim", "Analytics", 31.25, 4.6, 7,
            "Turn metrics, charts, and dashboards into narratives teams can act on.", "cover-blue", true),
        new Book("bk-105", "Small Shop Strategy", "Ava Chen", "Business", 24.95, 4.4, 18,
            "A field guide for running lean operations without losing craft or customer care.", "cover-gold", true),
        new Book("bk-106", "Frontend Field Notes", "Sam Rivera", "Engineering", 38.75, 4.9, 11,
            "Reusable lessons for state, layout, accessibility, and everyday UI polish.", "cover-sage", true));
  }
}

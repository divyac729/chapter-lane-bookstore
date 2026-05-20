package com.chapterlane.bookstore.order;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class OrderLine {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String bookId;
  private String title;
  private int quantity;
  private double unitPrice;

  @ManyToOne
  @JoinColumn(name = "order_id")
  private StoreOrder order;

  protected OrderLine() {
  }

  public OrderLine(String bookId, String title, int quantity, double unitPrice, StoreOrder order) {
    this.bookId = bookId;
    this.title = title;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.order = order;
  }

  public Long getId() {
    return id;
  }

  public String getBookId() {
    return bookId;
  }

  public String getTitle() {
    return title;
  }

  public int getQuantity() {
    return quantity;
  }

  public double getUnitPrice() {
    return unitPrice;
  }
}

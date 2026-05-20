package com.chapterlane.bookstore.order;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class StoreOrder {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String customerName;
  private String customerEmail;
  private String deliveryOption;
  private double subtotal;
  private double tax;
  private double total;
  private Instant createdAt;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderLine> lines = new ArrayList<>();

  protected StoreOrder() {
  }

  public StoreOrder(
      String customerName,
      String customerEmail,
      String deliveryOption,
      double subtotal,
      double tax,
      double total) {
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.deliveryOption = deliveryOption;
    this.subtotal = subtotal;
    this.tax = tax;
    this.total = total;
    this.createdAt = Instant.now();
  }

  public void addLine(String bookId, String title, int quantity, double unitPrice) {
    lines.add(new OrderLine(bookId, title, quantity, unitPrice, this));
  }

  public Long getId() {
    return id;
  }

  public String getCustomerName() {
    return customerName;
  }

  public String getCustomerEmail() {
    return customerEmail;
  }

  public String getDeliveryOption() {
    return deliveryOption;
  }

  public double getSubtotal() {
    return subtotal;
  }

  public double getTax() {
    return tax;
  }

  public double getTotal() {
    return total;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public List<OrderLine> getLines() {
    return lines;
  }
}

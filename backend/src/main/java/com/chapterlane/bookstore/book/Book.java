package com.chapterlane.bookstore.book;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Book {
  @Id
  private String id;

  @NotBlank
  private String title;

  @NotBlank
  private String author;

  @NotBlank
  private String genre;

  @DecimalMin("0.01")
  private double price;

  @DecimalMin("1.0")
  @DecimalMax("5.0")
  private double rating;

  @Min(0)
  private int stock;

  @NotBlank
  private String description;

  @NotBlank
  private String cover;

  private boolean published;

  protected Book() {
  }

  public Book(
      String id,
      String title,
      String author,
      String genre,
      double price,
      double rating,
      int stock,
      String description,
      String cover,
      boolean published) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.price = price;
    this.rating = rating;
    this.stock = stock;
    this.description = description;
    this.cover = cover;
    this.published = published;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String author) {
    this.author = author;
  }

  public String getGenre() {
    return genre;
  }

  public void setGenre(String genre) {
    this.genre = genre;
  }

  public double getPrice() {
    return price;
  }

  public void setPrice(double price) {
    this.price = price;
  }

  public double getRating() {
    return rating;
  }

  public void setRating(double rating) {
    this.rating = rating;
  }

  public int getStock() {
    return stock;
  }

  public void setStock(int stock) {
    this.stock = stock;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getCover() {
    return cover;
  }

  public void setCover(String cover) {
    this.cover = cover;
  }

  public boolean isPublished() {
    return published;
  }

  public void setPublished(boolean published) {
    this.published = published;
  }
}

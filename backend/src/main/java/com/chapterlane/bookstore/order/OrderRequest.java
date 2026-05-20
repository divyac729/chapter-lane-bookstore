package com.chapterlane.bookstore.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record OrderRequest(
    @NotBlank String customerName,
    @NotBlank @Email String customerEmail,
    @NotBlank String deliveryOption,
    @NotEmpty List<@Valid OrderItemRequest> items) {
  public record OrderItemRequest(@NotBlank String bookId, @Min(1) int quantity) {
  }
}

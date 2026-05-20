package com.chapterlane.bookstore.order;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<StoreOrder, Long> {
}

# Chapter Lane Bookstore

A bookstore web app with product browsing, cart management, checkout, an admin catalog manager and Java/PostgreSQL backend.

## Features

- Browse a book catalog with search, genre filters, and sorting
- Add books to a cart and adjust quantities
- Review subtotal, estimated tax, and total
- Complete a checkout flow
- Add, edit, publish, unpublish, and delete catalog items from the admin view
- Persist catalog data and orders with the Java backend and PostgreSQL

## Project Structure

```text
BookstoreApp/
├── backend/
│   ├── docker-compose.yml
│   ├── pom.xml
│   └── src/main/java/com/chapterlane/bookstore/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## Run Locally

Requirements:

- Java 21
- Maven 3.9+
- Docker, for the local PostgreSQL database

Start PostgreSQL:

```bash
cd backend
docker compose up -d
```

Start the Java API:

```bash
cd backend
mvn spring-boot:run
```

Then open `frontend/index.html` in a browser. The frontend calls the backend at:

```text
http://localhost:8080/api
```

The default database connection is:

```text
jdbc:postgresql://localhost:5432/bookstore
username: bookstore
password: bookstore
```

You can override it with:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/bookstore \
SPRING_DATASOURCE_USERNAME=bookstore \
SPRING_DATASOURCE_PASSWORD=bookstore \
mvn spring-boot:run
```

## API

```text
GET    /api/books
POST   /api/books
PUT    /api/books/{id}
DELETE /api/books/{id}
POST   /api/books/reset
GET    /api/orders
POST   /api/orders
```

## Notes

Checkout does not collect payment, but orders are saved and book stock is updated in PostgreSQL.

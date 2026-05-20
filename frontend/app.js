const API_BASE = window.BOOKSTORE_API_BASE || "http://localhost:8080/api";

let catalog = [];
let cart = [];
let activeView = "shop";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const elements = {
  viewButtons: document.querySelectorAll("[data-view-button]"),
  shopView: document.querySelector("#shopView"),
  adminView: document.querySelector("#adminView"),
  catalogGrid: document.querySelector("#catalogGrid"),
  genreFilter: document.querySelector("#genreFilter"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  cartToggle: document.querySelector("#cartToggle"),
  closeCart: document.querySelector("#closeCart"),
  cartDrawer: document.querySelector("#cartDrawer"),
  cartCount: document.querySelector("#cartCount"),
  cartItems: document.querySelector("#cartItems"),
  cartSubtotal: document.querySelector("#cartSubtotal"),
  cartTax: document.querySelector("#cartTax"),
  cartTotal: document.querySelector("#cartTotal"),
  checkoutButton: document.querySelector("#checkoutButton"),
  checkoutDialog: document.querySelector("#checkoutDialog"),
  checkoutForm: document.querySelector("#checkoutForm"),
  scrim: document.querySelector("#scrim"),
  toast: document.querySelector("#toast"),
  productForm: document.querySelector("#productForm"),
  productId: document.querySelector("#productId"),
  productTitle: document.querySelector("#productTitle"),
  productAuthor: document.querySelector("#productAuthor"),
  productGenre: document.querySelector("#productGenre"),
  productPrice: document.querySelector("#productPrice"),
  productRating: document.querySelector("#productRating"),
  productStock: document.querySelector("#productStock"),
  productDescription: document.querySelector("#productDescription"),
  productCover: document.querySelector("#productCover"),
  productPublished: document.querySelector("#productPublished"),
  clearForm: document.querySelector("#clearForm"),
  resetCatalog: document.querySelector("#resetCatalog"),
  adminList: document.querySelector("#adminList")
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function syncCatalogFromBackend(quiet = true) {
  try {
    catalog = await apiRequest("/books");
    render();
    if (!quiet) showToast("Catalog synced from PostgreSQL.");
  } catch (error) {
    catalog = [];
    cart = [];
    render();
    elements.catalogGrid.innerHTML = `<div class="empty-state">Start the Java backend to load the bookstore catalog.</div>`;
    elements.adminList.innerHTML = `<div class="empty-state">Backend connection required.</div>`;
    showToast("Backend connection required.");
  }
}

function render() {
  renderGenres();
  renderCatalog();
  renderCart();
  renderAdminList();
}

function renderGenres() {
  const selected = elements.genreFilter.value || "all";
  const genres = [...new Set(catalog.filter((book) => book.published).map((book) => book.genre))].sort();

  elements.genreFilter.innerHTML = `<option value="all">All genres</option>${genres
    .map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`)
    .join("")}`;
  elements.genreFilter.value = genres.includes(selected) ? selected : "all";
}

function getVisibleBooks() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const genre = elements.genreFilter.value;
  const sort = elements.sortSelect.value;

  const visible = catalog.filter((book) => {
    const matchesQuery =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query);
    const matchesGenre = genre === "all" || book.genre === genre;
    return book.published && matchesQuery && matchesGenre;
  });

  return visible.sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return catalog.indexOf(a) - catalog.indexOf(b);
  });
}

function renderCatalog() {
  const books = getVisibleBooks();

  if (!books.length) {
    elements.catalogGrid.innerHTML = `<div class="empty-state">No books match your current search.</div>`;
    return;
  }

  elements.catalogGrid.innerHTML = books.map((book) => {
    const isOut = book.stock <= 0;
    return `
      <article class="book-card">
        <div class="book-cover ${book.cover}">${escapeHtml(book.title)}</div>
        <div class="book-meta">
          <div class="pill-row">
            <span class="pill">${escapeHtml(book.genre)}</span>
            <strong>${book.rating.toFixed(1)} / 5</strong>
          </div>
          <h3>${escapeHtml(book.title)}</h3>
          <p>by ${escapeHtml(book.author)}</p>
          <p>${escapeHtml(book.description)}</p>
          <div class="pill-row">
            <span class="price">${money.format(book.price)}</span>
            <span>${book.stock} in stock</span>
          </div>
        </div>
        <button class="primary-button" data-add-to-cart="${book.id}" ${isOut ? "disabled" : ""}>
          ${isOut ? "Out of Stock" : "Add to Cart"}
        </button>
      </article>
    `;
  }).join("");
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const book = catalog.find((entry) => entry.id === item.id);
    return book ? sum + book.price * item.quantity : sum;
  }, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  elements.cartCount.textContent = count;
  elements.cartSubtotal.textContent = money.format(subtotal);
  elements.cartTax.textContent = money.format(tax);
  elements.cartTotal.textContent = money.format(total);
  elements.checkoutButton.disabled = cart.length === 0;

  if (!cart.length) {
    elements.cartItems.innerHTML = `<div class="empty-state">Your cart is empty.</div>`;
    return;
  }

  elements.cartItems.innerHTML = cart.map((item) => {
    const book = catalog.find((entry) => entry.id === item.id);
    if (!book) return "";

    return `
      <div class="cart-item">
        <div class="cart-item-header">
          <strong>${escapeHtml(book.title)}</strong>
          <span>${money.format(book.price * item.quantity)}</span>
        </div>
        <span>by ${escapeHtml(book.author)}</span>
        <div class="quantity-controls">
          <button data-decrease="${book.id}" aria-label="Decrease ${escapeHtml(book.title)} quantity">-</button>
          <strong>${item.quantity}</strong>
          <button data-increase="${book.id}" aria-label="Increase ${escapeHtml(book.title)} quantity">+</button>
          <button class="ghost-button" data-remove="${book.id}">Remove</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderAdminList() {
  elements.adminList.innerHTML = catalog.map((book) => `
    <div class="admin-row">
      <div>
        <h3>${escapeHtml(book.title)}</h3>
        <p>${escapeHtml(book.author)} · ${escapeHtml(book.genre)} · ${money.format(book.price)} · ${book.stock} stock · ${book.published ? "Published" : "Draft"}</p>
      </div>
      <div class="row-actions">
        <button class="secondary-button" data-edit="${book.id}">Edit</button>
        <button class="ghost-button" data-toggle-published="${book.id}">${book.published ? "Unpublish" : "Publish"}</button>
        <button class="ghost-button" data-delete="${book.id}">Delete</button>
      </div>
    </div>
  `).join("");
}

function addToCart(bookId) {
  const book = catalog.find((entry) => entry.id === bookId);
  if (!book || book.stock <= 0) return;

  const item = cart.find((entry) => entry.id === bookId);
  if (item) {
    if (item.quantity >= book.stock) {
      showToast("No more stock available for this book.");
      return;
    }
    item.quantity += 1;
  } else {
    cart.push({ id: bookId, quantity: 1 });
  }

  renderCart();
  showToast(`${book.title} added to cart.`);
}

function updateQuantity(bookId, change) {
  const item = cart.find((entry) => entry.id === bookId);
  const book = catalog.find((entry) => entry.id === bookId);
  if (!item || !book) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== bookId);
  }
  if (item.quantity > book.stock) {
    item.quantity = book.stock;
    showToast("Stock limit reached.");
  }

  renderCart();
}

function removeFromCart(bookId) {
  cart = cart.filter((entry) => entry.id !== bookId);
  renderCart();
}

function setView(view) {
  activeView = view;
  elements.viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewButton === view);
  });

  const isAdmin = activeView === "admin";
  elements.shopView.classList.toggle("hidden", isAdmin);
  document.querySelector(".toolbar").classList.toggle("hidden", isAdmin);
  elements.catalogGrid.classList.toggle("hidden", isAdmin);
  elements.adminView.classList.toggle("hidden", !isAdmin);
}

function openCart() {
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  elements.scrim.classList.remove("hidden");
}

function closeCart() {
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
  elements.scrim.classList.add("hidden");
}

function fillForm(book) {
  elements.productId.value = book.id;
  elements.productTitle.value = book.title;
  elements.productAuthor.value = book.author;
  elements.productGenre.value = book.genre;
  elements.productPrice.value = book.price;
  elements.productRating.value = book.rating;
  elements.productStock.value = book.stock;
  elements.productDescription.value = book.description;
  elements.productCover.value = book.cover;
  elements.productPublished.checked = book.published;
  elements.productTitle.focus();
}

function clearProductForm() {
  elements.productForm.reset();
  elements.productId.value = "";
  elements.productPublished.checked = true;
}

async function handleProductSubmit(event) {
  event.preventDefault();

  const id = elements.productId.value || `bk-${Date.now()}`;
  const product = {
    id,
    title: elements.productTitle.value.trim(),
    author: elements.productAuthor.value.trim(),
    genre: elements.productGenre.value.trim(),
    price: Number(elements.productPrice.value),
    rating: Number(elements.productRating.value),
    stock: Number(elements.productStock.value),
    description: elements.productDescription.value.trim(),
    cover: elements.productCover.value,
    published: elements.productPublished.checked
  };

  try {
    const existingIndex = catalog.findIndex((book) => book.id === id);
    const method = existingIndex >= 0 ? "PUT" : "POST";
    const path = existingIndex >= 0 ? `/books/${encodeURIComponent(id)}` : "/books";
    await apiRequest(path, {
      method,
      body: JSON.stringify(product)
    });
    await syncCatalogFromBackend();
    clearProductForm();
    showToast("Catalog saved to PostgreSQL.");
  } catch (error) {
    showToast("Backend save failed.");
  }
}

async function handleCheckout(event) {
  event.preventDefault();
  const name = document.querySelector("#customerName").value.trim();
  const email = document.querySelector("#customerEmail").value.trim();
  const deliveryOption = document.querySelector("#deliveryOption").value;

  try {
    await apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        customerName: name,
        customerEmail: email,
        deliveryOption,
        items: cart.map((item) => ({
          bookId: item.id,
          quantity: item.quantity
        }))
      })
    });
    cart = [];
    await syncCatalogFromBackend();
    elements.checkoutDialog.close();
    closeCart();
    elements.checkoutForm.reset();
    showToast(`Thanks, ${name}. Your order was saved.`);
  } catch (error) {
    showToast("Backend checkout failed.");
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}

elements.viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.viewButton));
});

elements.searchInput.addEventListener("input", renderCatalog);
elements.genreFilter.addEventListener("change", renderCatalog);
elements.sortSelect.addEventListener("change", renderCatalog);
elements.cartToggle.addEventListener("click", openCart);
elements.closeCart.addEventListener("click", closeCart);
elements.scrim.addEventListener("click", closeCart);
elements.clearForm.addEventListener("click", clearProductForm);
elements.productForm.addEventListener("submit", handleProductSubmit);
elements.checkoutForm.addEventListener("submit", handleCheckout);

elements.checkoutButton.addEventListener("click", () => {
  if (!cart.length) {
    showToast("Add at least one book before checkout.");
    return;
  }
  elements.checkoutDialog.showModal();
});

elements.catalogGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-to-cart]");
  if (button) addToCart(button.dataset.addToCart);
});

elements.cartItems.addEventListener("click", (event) => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");

  if (increase) updateQuantity(increase.dataset.increase, 1);
  if (decrease) updateQuantity(decrease.dataset.decrease, -1);
  if (remove) removeFromCart(remove.dataset.remove);
});

elements.adminList.addEventListener("click", async (event) => {
  const edit = event.target.closest("[data-edit]");
  const toggle = event.target.closest("[data-toggle-published]");
  const deleteButton = event.target.closest("[data-delete]");

  if (edit) {
    const book = catalog.find((entry) => entry.id === edit.dataset.edit);
    if (book) fillForm(book);
  }

  if (toggle) {
    const book = catalog.find((entry) => entry.id === toggle.dataset.togglePublished);
    if (book) {
      try {
        await apiRequest(`/books/${encodeURIComponent(book.id)}`, {
          method: "PUT",
          body: JSON.stringify({ ...book, published: !book.published })
        });
        await syncCatalogFromBackend();
      } catch (error) {
        showToast("Backend update failed.");
      }
    }
  }

  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    try {
      await apiRequest(`/books/${encodeURIComponent(id)}`, { method: "DELETE" });
      await syncCatalogFromBackend();
      cart = cart.filter((entry) => entry.id !== id);
      renderCart();
      showToast("Book deleted from PostgreSQL.");
    } catch (error) {
      showToast("Backend delete failed.");
    }
  }
});

elements.resetCatalog.addEventListener("click", async () => {
  try {
    catalog = await apiRequest("/books/reset", { method: "POST" });
    cart = [];
    clearProductForm();
    render();
    showToast("PostgreSQL catalog reset.");
  } catch (error) {
    showToast("Backend reset failed.");
  }
});

syncCatalogFromBackend(false);

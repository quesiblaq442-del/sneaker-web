const products = [
  { id: 1, name: 'Nike Air Max 90', brand: 'Nike', price: 120, rating: 4.8, reviews: 256, image: '1000534022.jpg', badge: 'Hot' },
  { id: 2, name: 'Adidas Ultraboost 22', brand: 'Adidas', price: 150, rating: 4.7, reviews: 189, image: '1000534021.jpg', badge: 'New' },
  { id: 3, name: 'Jordan Retro 1', brand: 'Jordan', price: 200, rating: 4.9, reviews: 342, image: '1000534020.jpg', badge: 'Sale' },
  { id: 4, name: 'Nike React Infinity', brand: 'Nike', price: 160, rating: 4.6, reviews: 198, image: '1000534023.jpg', badge: 'Popular' },
  { id: 5, name: 'Adidas Stan Smith', brand: 'Adidas', price: 85, rating: 4.5, reviews: 421, image: '1000534024.jpg', badge: 'Classic' },
  { id: 6, name: 'Jordan 23', brand: 'Jordan', price: 180, rating: 4.8, reviews: 267, image: '1000534025.jpg', badge: 'Trending' }
];

let cart = [];
let currentFilter = 'all';
let darkMode = localStorage.getItem('sneaker-theme') === 'dark';

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;

function init() {
  applyTheme();
  bindEvents();
  renderProducts();
  renderCart();
  updateCartCount();
}

function bindEvents() {
  document.getElementById('theme-toggle').addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('sneaker-theme', darkMode ? 'dark' : 'light');
    applyTheme();
  });

  document.getElementById('cart-btn').addEventListener('click', () => {
    document.getElementById('cart-modal').style.display = 'flex';
    document.getElementById('cart-modal').setAttribute('aria-hidden', 'false');
  });

  document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('cart-modal').setAttribute('aria-hidden', 'true');
  });

  document.getElementById('checkout-btn').addEventListener('click', checkout);

  document.getElementById('search-input').addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    renderProducts(query, currentFilter);
  });

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.toggle('active', btn === button));
      renderProducts(document.getElementById('search-input').value.trim().toLowerCase(), currentFilter);
    });
  });

  document.getElementById('contact-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
      showNotification('Please fill in all fields before sending.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    showNotification('Thanks for reaching out! We will get back to you soon.', 'success');
    event.target.reset();
  });

  document.getElementById('newsletter-btn').addEventListener('click', () => {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotification('Please enter a valid email for our newsletter.', 'error');
      return;
    }

    emailInput.value = '';
    showNotification('You are subscribed to our newsletter!', 'success');
  });

  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  document.getElementById('cart-modal').addEventListener('click', (event) => {
    if (event.target === document.getElementById('cart-modal')) {
      document.getElementById('cart-modal').style.display = 'none';
      document.getElementById('cart-modal').setAttribute('aria-hidden', 'true');
    }
  });
}

function applyTheme() {
  document.body.classList.toggle('dark-mode', darkMode);
  const icon = document.querySelector('#theme-toggle i');
  icon.classList.toggle('fa-moon', !darkMode);
  icon.classList.toggle('fa-sun', darkMode);
}

function renderProducts(query = '', filter = 'all') {
  const container = document.getElementById('products-grid');

  const filtered = products.filter((product) => {
    const matchesFilter = filter === 'all' || product.brand.toLowerCase() === filter;
    const matchesSearch = !query || product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (!filtered.length) {
    container.innerHTML = '<div class="empty-state">No products found.</div>';
    return;
  }

  container.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" />
        <span class="product-badge">${product.badge}</span>
      </div>

      <div class="product-body">
        <p class="product-brand">${product.brand}</p>
        <h3>${product.name}</h3>

        <div class="rating-row">
          <div class="stars">${renderStars(product.rating)}</div>
          <span>(${product.reviews})</span>
        </div>

        <div class="product-footer">
          <strong>${formatPrice(product.price)}</strong>
          <div class="card-actions">
            <button type="button" class="add-btn" data-id="${product.id}">Add</button>
            <button type="button" class="wishlist-btn" data-id="${product.id}" aria-label="Add to wishlist">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const product = products.find((item) => item.id === Number(button.dataset.id));
      addToCart(product);
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const product = products.find((item) => item.id === Number(button.dataset.id));
      toggleWishlist(product);
    });
  });
}

function renderStars(rating) {
  const fullStars = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => {
    const active = index < fullStars;
    return `<i class="${active ? 'fas fa-star' : 'far fa-star'}"></i>`;
  }).join('');
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartCount();
  renderCart();
  showNotification(`${product.name} added to cart.`, 'success');
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = total;
}

function renderCart() {
  const container = document.getElementById('cart-items');

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-bag"></i>
        <p>Your cart is empty.</p>
      </div>
    `;
    document.getElementById('subtotal').textContent = '$0.00';
    document.getElementById('shipping').textContent = '$0.00';
    document.getElementById('total').textContent = '$0.00';
    return;
  }

  container.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-thumb">
        <img src="${item.image}" alt="${item.name}" />
      </div>

      <div class="cart-details">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)}</p>
      </div>

      <div class="qty-block">
        <div class="qty-controls">
          <button type="button" data-action="decrease" data-id="${item.id}">−</button>
          <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" />
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button type="button" class="remove-btn" data-id="${item.id}">Remove</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.qty-controls button').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      const item = cart.find((entry) => entry.id === id);
      const nextQty = button.dataset.action === 'increase' ? item.quantity + 1 : item.quantity - 1;
      updateQuantity(id, nextQty);
    });
  });

  document.querySelectorAll('.qty-controls input').forEach((input) => {
    input.addEventListener('change', (event) => {
      const id = Number(event.target.dataset.id);
      const value = Number(event.target.value) || 1;
      updateQuantity(id, value);
    });
  });

  document.querySelectorAll('.remove-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      cart = cart.filter((item) => item.id !== id);
      updateCartCount();
      renderCart();
    });
  });

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : formatPrice(shipping);
  document.getElementById('total').textContent = formatPrice(total);
}

function updateQuantity(id, value) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  item.quantity = Math.max(1, Number(value) || 1);
  updateCartCount();
  renderCart();
}

function toggleWishlist(product) {
  const wishlist = JSON.parse(localStorage.getItem('sneaker-wishlist') || '[]');
  const exists = wishlist.some((item) => item.id === product.id);

  if (exists) {
    const updated = wishlist.filter((item) => item.id !== product.id);
    localStorage.setItem('sneaker-wishlist', JSON.stringify(updated));
    showNotification(`${product.name} removed from wishlist.`, 'success');
  } else {
    wishlist.push({ id: product.id, name: product.name });
    localStorage.setItem('sneaker-wishlist', JSON.stringify(wishlist));
    showNotification(`${product.name} added to wishlist.`, 'success');
  }
}

function checkout() {
  if (!cart.length) {
    showNotification('Your cart is empty.', 'error');
    return;
  }

  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  showNotification(`Processing payment for ${formatPrice(total)}...`, 'success');

  setTimeout(() => {
    cart = [];
    updateCartCount();
    renderCart();
    document.getElementById('cart-modal').style.display = 'none';
    showNotification('Order placed successfully! Thanks for shopping with us.', 'success');
  }, 1200);
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.remove('success', 'error');
  notification.classList.add(type);
  notification.classList.add('show');

  clearTimeout(showNotification.timeoutId);
  showNotification.timeoutId = setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

window.addEventListener('DOMContentLoaded', init);


																																																																																																																																																																																																																																																																											
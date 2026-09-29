// Shopping cart functionality
let cart = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  loadCartFromStorage();
  renderCartCount();
  attachAddToCartListeners();
  attachFormValidation();
  attachSmoothScroll();
});

// Add to cart functionality
function attachAddToCartListeners() {
  const products = [
    { id: 1, name: 'Nike Air Max', price: 120 },
    { id: 2, name: 'Adidas Ultraboost', price: 150 },
    { id: 3, name: 'Jordan Retro', price: 200 }
  ];

  const productItems = document.querySelectorAll('.product-item');
  productItems.forEach((item, index) => {
    const button = document.createElement('button');
    button.textContent = 'Add to Cart';
    button.type = 'button';
    button.className = 'add-to-cart-btn';
    button.addEventListener('click', function(e) {
      e.preventDefault();
      addToCart(products[index]);
      showNotification(`${products[index].name} added to cart!`);
    });
    item.appendChild(button);
  });
}

// Add item to cart
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCartToStorage();
  renderCartCount();
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  renderCartCount();
  renderCart();
}

// Update item quantity
function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCartToStorage();
    renderCart();
    renderCartCount();
  }
}

// Save cart to localStorage
function saveCartToStorage() {
  localStorage.setItem('sneakerCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
  const saved = localStorage.getItem('sneakerCart');
  cart = saved ? JSON.parse(saved) : [];
}

// Render cart count badge
function renderCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  let badge = document.getElementById('cart-count');
  
  if (!badge) {
    badge = document.createElement('span');
    badge.id = 'cart-count';
    badge.className = 'cart-count-badge';
    const cartLink = document.querySelector('nav a[href="#cart"]');
    if (cartLink) {
      cartLink.appendChild(badge);
    }
  }
  
  badge.textContent = totalItems;
  badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
}

// Render cart modal
function renderCart() {
  let modal = document.getElementById('cart-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let cartHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Shopping Cart</h2>
      ${cart.length === 0 ? '<p>Your cart is empty</p>' : `
        <div class="cart-items">
          ${cart.map(item => `
            <div class="cart-item">
              <h3>${item.name}</h3>
              <p>Price: $${item.price}</p>
              <div class="quantity-control">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
              </div>
              <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
              <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
          `).join('')}
        </div>
        <div class="cart-total">
          <h3>Total: $${total.toFixed(2)}</h3>
          <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        </div>
      `}
    </div>
  `;

  modal.innerHTML = cartHTML;
  modal.style.display = 'block';

  const closeBtn = modal.querySelector('.close');
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// Checkout function
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  showNotification('Proceeding to checkout... This is a demo.');
  setTimeout(() => {
    alert('Thank you for your order! This is a demo store.');
  }, 1500);
}

// Form validation
function attachFormValidation() {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      
      if (!nameInput.value.trim()) {
        alert('Please enter your name');
        return;
      }
      
      if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
        alert('Please enter a valid email address');
        return;
      }
      
      showNotification('Thank you for contacting us! We will be in touch soon.');
      form.reset();
    });
  }
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Smooth scroll to sections
function attachSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Notification system
function showNotification(message) {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = 'notification show';
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Search functionality
function searchProducts(query) {
  const productItems = document.querySelectorAll('.product-item');
  const lowerQuery = query.toLowerCase();
  
  productItems.forEach(item => {
    const productName = item.querySelector('h3').textContent.toLowerCase();
    if (productName.includes(lowerQuery)) {
      item.style.display = 'grid';
    } else {
      item.style.display = 'none';
    }
  });
}

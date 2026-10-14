// ==========================================
// ATELIER LUXE - Main Application Controller
// ==========================================

class App {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'featured';
    this.priceLimit = 1500;

    this.init();
  }

  init() {
    // Initialize components
    window.cart = new Cart();
    window.dressingRoom = new DressingRoom();

    this.cacheElements();
    this.bindEvents();
    this.renderCatalog();
    this.renderLookbook();
  }

  cacheElements() {
    this.catalogGrid = document.getElementById('catalog-products-grid');
    this.categoryFilters = document.getElementById('catalog-category-filters');
    this.searchInput = document.getElementById('catalog-search-input');
    this.sortSelect = document.getElementById('catalog-sort-select');
    this.priceRangeInput = document.getElementById('catalog-price-range');
    this.priceRangeDisplay = document.getElementById('catalog-price-display');
    this.productModal = document.getElementById('product-detail-modal');
    this.productModalBody = document.getElementById('product-modal-body');
    this.checkoutModal = document.getElementById('checkout-modal');
    this.checkoutModalBody = document.getElementById('checkout-modal-body');
    this.toastContainer = document.getElementById('toast-container');
    this.lookbookGrid = document.getElementById('lookbook-grid');
  }

  bindEvents() {
    // Category pill filtering
    if (this.categoryFilters) {
      this.categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-pill');
        if (!btn) return;
        document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.renderCatalog();
      });
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalog();
      });
    }

    // Sort select
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.renderCatalog();
      });
    }

    // Price range slider
    if (this.priceRangeInput) {
      this.priceRangeInput.addEventListener('input', (e) => {
        this.priceLimit = parseInt(e.target.value);
        if (this.priceRangeDisplay) {
          this.priceRangeDisplay.textContent = `$${this.priceLimit}`;
        }
        this.renderCatalog();
      });
    }

    // Modal close clicks on backdrop
    if (this.productModal) {
      this.productModal.addEventListener('click', (e) => {
        if (e.target === this.productModal || e.target.closest('.modal-close-btn')) {
          this.closeProductModal();
        }
      });
    }

    if (this.checkoutModal) {
      this.checkoutModal.addEventListener('click', (e) => {
        if (e.target === this.checkoutModal || e.target.closest('.modal-close-btn')) {
          this.closeCheckoutModal();
        }
      });
    }

    // Smooth navigation jumps
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId === '') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  getFilteredProducts() {
    return PRODUCTS_DATA.filter(item => {
      const matchesCategory = this.currentCategory === 'all' || item.category === this.currentCategory;
      const matchesSearch = !this.searchQuery || 
        item.name.toLowerCase().includes(this.searchQuery) ||
        item.description.toLowerCase().includes(this.searchQuery) ||
        item.fabric.toLowerCase().includes(this.searchQuery);
      const matchesPrice = item.price <= this.priceLimit;

      return matchesCategory && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (this.sortBy === 'price-low') return a.price - b.price;
      if (this.sortBy === 'price-high') return b.price - a.price;
      if (this.sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }

  renderCatalog() {
    if (!this.catalogGrid) return;

    const products = this.getFilteredProducts();

    if (products.length === 0) {
      this.catalogGrid.innerHTML = `
        <div class="no-results-state">
          <h3>No couture pieces found</h3>
          <p>Try refining your search terms or expanding your price criteria.</p>
          <button class="btn-secondary" onclick="window.app.resetFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    this.catalogGrid.innerHTML = products.map(product => {
      const isEquipped = Object.values(window.dressingRoom.equipped).includes(product.id);

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-card-media">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            
            <div class="product-card-hover-actions">
              <button class="btn-card-tryon ${isEquipped ? 'active' : ''}" onclick="window.app.quickTryOn('${product.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path>
                </svg>
                ${isEquipped ? 'Draped on Mannequin ✓' : 'Virtual Try-On'}
              </button>
              <button class="btn-card-quickview" onclick="window.app.openProductModal('${product.id}')">
                Quick View
              </button>
            </div>
          </div>

          <div class="product-card-content">
            <div class="product-category-row">
              <span class="product-category-tag">${product.category.toUpperCase()}</span>
              <div class="product-rating">
                <span class="star-icon">★</span>
                <span>${product.rating}</span>
                <span class="reviews-count">(${product.reviewsCount})</span>
              </div>
            </div>

            <h3 class="product-title" onclick="window.app.openProductModal('${product.id}')">${product.name}</h3>
            <p class="product-tagline">${product.tagline}</p>

            <div class="product-footer-row">
              <div class="price-container">
                <span class="current-price">$${product.price}</span>
                ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
              </div>

              <div class="swatches-preview">
                ${product.colors.map(col => `
                  <span class="mini-swatch" style="background-color: ${col.hex};" title="${col.name}"></span>
                `).join('')}
              </div>
            </div>

            <div class="product-primary-action">
              <button class="btn-add-bag" onclick="window.app.quickAddToCart('${product.id}')">
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  quickTryOn(productId) {
    window.dressingRoom.equipGarment(productId);
    const dressingSection = document.getElementById('dressing-room-section');
    if (dressingSection) {
      dressingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  quickAddToCart(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    window.cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: 'S',
      color: product.defaultColor
    });

    this.showToast(`Added ${product.name} to your shopping bag! 🛍️`);
  }

  openProductModal(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product || !this.productModal || !this.productModalBody) return;

    const isEquipped = Object.values(window.dressingRoom.equipped).includes(product.id);

    this.productModalBody.innerHTML = `
      <div class="modal-product-layout">
        <div class="modal-product-gallery">
          <img src="${product.image}" alt="${product.name}" class="modal-main-img" />
          <div class="modal-gallery-badge">${product.season} Collection</div>
        </div>

        <div class="modal-product-details">
          <div class="modal-brand-header">ATELIER HAUTE COUTURE</div>
          <h2 class="modal-product-title">${product.name}</h2>
          <div class="modal-rating-row">
            <div class="product-rating">
              <span class="star-icon">★</span>
              <span>${product.rating}</span>
              <span class="reviews-count">(${product.reviewsCount} Verified Reviews)</span>
            </div>
            <span class="modal-stock-status">In Stock • Ready for Delivery</span>
          </div>

          <div class="modal-price-row">
            <span class="modal-price">$${product.price}</span>
            ${product.originalPrice ? `<span class="modal-orig-price">$${product.originalPrice}</span>` : ''}
            <span class="tax-inclusive-tag">Tax Included</span>
          </div>

          <p class="modal-description">${product.description}</p>

          <div class="modal-specs-block">
            <div class="spec-row">
              <span class="spec-label">Fabric Composition:</span>
              <span class="spec-value">${product.fabric}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Artisanal Origin:</span>
              <span class="spec-value">Handcrafted in Milan, Italy</span>
            </div>
          </div>

          <div class="modal-color-picker-section">
            <label class="modal-section-label">Select Colorway:</label>
            <div class="modal-color-swatches">
              ${product.colors.map((col, idx) => `
                <button class="modal-color-btn ${idx === 0 ? 'selected' : ''}" 
                  style="background-color: ${col.hex};" 
                  title="${col.name}"
                  data-hex="${col.hex}">
                  <span>${col.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="modal-size-picker-section">
            <div class="size-header-row">
              <label class="modal-section-label">Select Size:</label>
              <a href="#size-guide" class="size-guide-link" onclick="alert('Fit True to Size. Model is 5\\\'10\\\" wearing size S.')">Size Guide</a>
            </div>
            <div class="modal-sizes-grid">
              ${product.sizes.map((s, idx) => `
                <button class="modal-size-btn ${idx === 1 || product.sizes.length === 1 ? 'selected' : ''}" data-size="${s}">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="modal-actions-row">
            <button class="btn-modal-add-bag" onclick="window.app.addModalProductToBag('${product.id}')">
              Add to Shopping Bag
            </button>
            <button class="btn-modal-tryon ${isEquipped ? 'active' : ''}" onclick="window.app.tryOnFromModal('${product.id}')">
              ${isEquipped ? 'Draped ✓' : 'Try On In Dressing Room'}
            </button>
          </div>

          <div class="modal-perks-row">
            <div class="perk-item">
              <span>✈️ Complimentary Worldwide Express Delivery</span>
            </div>
            <div class="perk-item">
              <span>🔒 Authenticity Guaranteed with NFC Chip</span>
            </div>
            <div class="perk-item">
              <span>🔄 30-Day Bespoke Returns & Exchanges</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind size & color toggles within modal
    this.productModalBody.querySelectorAll('.modal-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.productModalBody.querySelectorAll('.modal-color-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    this.productModalBody.querySelectorAll('.modal-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.productModalBody.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    this.productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeProductModal() {
    if (this.productModal) this.productModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  addModalProductToBag(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const selectedColorBtn = this.productModalBody.querySelector('.modal-color-btn.selected');
    const selectedSizeBtn = this.productModalBody.querySelector('.modal-size-btn.selected');

    const color = selectedColorBtn ? selectedColorBtn.dataset.hex : product.defaultColor;
    const size = selectedSizeBtn ? selectedSizeBtn.dataset.size : 'S';

    window.cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      color
    });

    this.closeProductModal();
    this.showToast(`Added ${product.name} (${size}) to your bag! 🛍️`);
    window.cart.openDrawer();
  }

  tryOnFromModal(productId) {
    this.closeProductModal();
    this.quickTryOn(productId);
  }

  openCheckoutModal() {
    if (!this.checkoutModal || !this.checkoutModalBody) return;
    const totals = window.cart.calculateTotals();

    this.checkoutModalBody.innerHTML = `
      <div class="checkout-layout">
        <div class="checkout-form-column">
          <div class="checkout-brand">ATELIER LUXE EXPRESS CHECKOUT</div>
          
          <div class="checkout-section-group">
            <h3>1. Contact & Delivery</h3>
            <div class="form-row dual">
              <input type="text" class="form-input" id="checkout-fname" placeholder="First Name" value="Gopika" required />
              <input type="text" class="form-input" id="checkout-lname" placeholder="Last Name" value="Vikas" required />
            </div>
            <div class="form-row">
              <input type="email" class="form-input" id="checkout-email" placeholder="Email Address for Order Confirmation" value="gopika@atelier-luxe.com" required />
            </div>
            <div class="form-row">
              <input type="text" class="form-input" id="checkout-address" placeholder="Shipping Street Address" value="750 5th Avenue, Suite 1200" required />
            </div>
            <div class="form-row triple">
              <input type="text" class="form-input" placeholder="City" value="New York" />
              <input type="text" class="form-input" placeholder="State/Province" value="NY" />
              <input type="text" class="form-input" placeholder="Postal Code" value="10019" />
            </div>
          </div>

          <div class="checkout-section-group">
            <h3>2. Payment Method</h3>
            <div class="payment-tabs">
              <label class="payment-tab active">
                <input type="radio" name="payment-method" checked />
                <span>💳 Credit / Debit Card</span>
              </label>
              <label class="payment-tab">
                <input type="radio" name="payment-method" />
                <span> Apple Pay / Google Pay</span>
              </label>
              <label class="payment-tab">
                <input type="radio" name="payment-method" />
                <span>💎 Klarna (4x Interest-Free)</span>
              </label>
            </div>

            <div class="card-inputs-block">
              <input type="text" class="form-input" placeholder="Card Number" value="•••• •••• •••• 4242" />
              <div class="form-row dual">
                <input type="text" class="form-input" placeholder="MM / YY" value="08/28" />
                <input type="text" class="form-input" placeholder="CVC" value="888" />
              </div>
            </div>
          </div>

          <button class="btn-submit-order" onclick="window.app.processOrder()">
            Place Order • $${totals.grandTotal.toFixed(0)}
          </button>
          <div class="checkout-encryption-note">
            <span>🔒 256-bit SSL Encrypted & PCI DSS Level 1 Certified</span>
          </div>
        </div>

        <div class="checkout-summary-column">
          <div class="order-summary-box">
            <h3>Order Summary (${totals.totalCount} items)</h3>
            <div class="checkout-items-preview">
              ${window.cart.items.map(item => `
                <div class="checkout-item-line">
                  <img src="${item.image}" alt="${item.name}" />
                  <div class="checkout-item-meta">
                    <span class="checkout-name">${item.name}</span>
                    <span class="checkout-details">Size: ${item.size} • Qty: ${item.quantity}</span>
                  </div>
                  <span class="checkout-price">$${(item.price * item.quantity).toFixed(0)}</span>
                </div>
              `).join('')}
            </div>

            <div class="checkout-financials">
              <div class="fin-row">
                <span>Subtotal</span>
                <span>$${totals.subtotal.toFixed(0)}</span>
              </div>
              ${totals.discountAmount > 0 ? `
                <div class="fin-row discount">
                  <span>Promo Discount (${window.cart.promoCode || 'Bundle'})</span>
                  <span>-$${totals.discountAmount.toFixed(0)}</span>
                </div>
              ` : ''}
              <div class="fin-row">
                <span>White-Glove Delivery</span>
                <span>${totals.isFreeShipping ? 'FREE' : '$25'}</span>
              </div>
              <div class="fin-row">
                <span>Estimated Taxes</span>
                <span>$${totals.tax.toFixed(0)}</span>
              </div>
              <div class="fin-row total-row">
                <span>Total Due</span>
                <span>$${totals.grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.checkoutModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeCheckoutModal() {
    if (this.checkoutModal) this.checkoutModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  processOrder() {
    const orderNumber = `ATL-${Math.floor(100000 + Math.random() * 900000)}`;
    const totals = window.cart.calculateTotals();

    this.checkoutModalBody.innerHTML = `
      <div class="order-confirmation-screen">
        <div class="order-success-icon">✓</div>
        <div class="brand-crest">ATELIER LUXE</div>
        <h2>Thank You for Your Order</h2>
        <p class="order-id-label">Order Reference: <strong>#${orderNumber}</strong></p>
        <p class="order-msg">
          A receipt and bespoke courier tracking number have been dispatched to your email.
          Your garments are being prepared with artisanal care in our Florence atelier.
        </p>

        <div class="confirmation-details-box">
          <div class="conf-row">
            <span>Total Charged:</span>
            <strong>$${totals.grandTotal.toFixed(0)} USD</strong>
          </div>
          <div class="conf-row">
            <span>Estimated Delivery:</span>
            <strong>2-3 Business Days (Express Air)</strong>
          </div>
          <div class="conf-row">
            <span>Delivery Destination:</span>
            <strong>750 5th Avenue, New York, NY</strong>
          </div>
        </div>

        <div class="confirmation-actions">
          <button class="btn-primary" onclick="window.app.closeCheckoutModal(); window.cart.clearCart();">
            Continue Shopping
          </button>
        </div>
      </div>
    `;

    this.showToast('Order confirmed! Welcome to the Atelier Circle. ✨');
  }

  renderLookbook() {
    if (!this.lookbookGrid) return;
    const looks = window.dressingRoom.savedLooks;

    if (looks.length === 0) {
      this.lookbookGrid.innerHTML = `
        <div class="lookbook-empty">
          <p>You haven't saved any looks yet. Style your mannequin in the Virtual Dressing Room and click "Save to Lookbook"!</p>
        </div>
      `;
      return;
    }

    this.lookbookGrid.innerHTML = looks.map(look => `
      <div class="lookbook-item-card">
        <div class="lookbook-item-header">
          <h4>${look.name}</h4>
          <span class="lookbook-date">${look.date}</span>
        </div>
        <div class="lookbook-tags">
          ${look.items.map(i => `<span class="tag-pill">${i.name}</span>`).join('')}
        </div>
        <button class="btn-restore-look" onclick="window.app.restoreLook(${look.id})">
          Wear on Mannequin 👗
        </button>
      </div>
    `).join('');
  }

  restoreLook(lookId) {
    const look = window.dressingRoom.savedLooks.find(l => l.id === lookId);
    if (!look) return;

    window.dressingRoom.avatar = { ...look.avatar };
    window.dressingRoom.equipped = { ...look.equipped };
    window.dressingRoom.renderMannequin();
    window.dressingRoom.updateEquippedListUI();
    window.dressingRoom.renderWardrobeRail();

    const dressingSection = document.getElementById('dressing-room-section');
    if (dressingSection) {
      dressingSection.scrollIntoView({ behavior: 'smooth' });
    }

    this.showToast(`Loaded "${look.name}" onto the mannequin!`);
  }

  resetFilters() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.priceLimit = 1500;
    if (this.searchInput) this.searchInput.value = '';
    if (this.priceRangeInput) this.priceRangeInput.value = 1500;
    if (this.priceRangeDisplay) this.priceRangeDisplay.textContent = '$1500';
    document.querySelectorAll('.filter-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
    });
    this.renderCatalog();
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span class="toast-text">${message}</span>
    `;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
}

// Bootstrap once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

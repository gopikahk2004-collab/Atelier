// ==========================================
// ATELIER LUXE - Shopping Cart & Checkout Engine
// ==========================================

class Cart {
  constructor() {
    this.items = [];
    this.promoCode = null;
    this.discountPercent = 0;
    this.freeShippingThreshold = 250;
    this.currency = 'USD';
    this.currencySymbol = '$';
    this.exchangeRate = 1.0;

    this.init();
  }

  init() {
    this.loadFromStorage();
    this.cacheElements();
    this.bindEvents();
    this.render();
  }

  cacheElements() {
    this.drawer = document.getElementById('cart-drawer');
    this.overlay = document.getElementById('cart-overlay');
    this.cartItemsList = document.getElementById('cart-items-list');
    this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
    this.cartSubtotalEl = document.getElementById('cart-subtotal');
    this.cartDiscountRow = document.getElementById('cart-discount-row');
    this.cartDiscountEl = document.getElementById('cart-discount-amount');
    this.cartTotalEl = document.getElementById('cart-grand-total');
    this.shippingProgressFill = document.getElementById('shipping-progress-fill');
    this.shippingTextEl = document.getElementById('shipping-threshold-text');
    this.promoInput = document.getElementById('cart-promo-input');
    this.btnApplyPromo = document.getElementById('btn-apply-promo');
    this.btnCheckout = document.getElementById('btn-cart-checkout');
    this.btnCloseCart = document.getElementById('btn-close-cart');
    this.cartEmptyState = document.getElementById('cart-empty-state');
  }

  bindEvents() {
    if (this.btnCloseCart) {
      this.btnCloseCart.addEventListener('click', () => this.closeDrawer());
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeDrawer());
    }

    // Open cart drawer from header bag icons
    document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
      btn.addEventListener('click', () => this.openDrawer());
    });

    if (this.btnApplyPromo) {
      this.btnApplyPromo.addEventListener('click', () => {
        const code = this.promoInput.value.trim().toUpperCase();
        this.applyPromo(code);
      });
    }

    if (this.btnCheckout) {
      this.btnCheckout.addEventListener('click', () => {
        this.closeDrawer();
        if (window.app && window.app.openCheckoutModal) {
          window.app.openCheckoutModal();
        }
      });
    }
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('atelier_luxe_cart');
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch (e) {
      this.items = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('atelier_luxe_cart', JSON.stringify(this.items));
    } catch (e) {
      // ignore
    }
  }

  openDrawer() {
    if (this.drawer) this.drawer.classList.add('open');
    if (this.overlay) this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    if (this.drawer) this.drawer.classList.remove('open');
    if (this.overlay) this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  addItem({ id, name, price, image, size = 'S', color = '#000', isBundle = false }) {
    const existing = this.items.find(item => item.id === id && item.size === size && item.color === color);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        cartItemId: `${id}-${size}-${color}-${Date.now()}`,
        id,
        name,
        price,
        image,
        size,
        color,
        quantity: 1,
        isBundle
      });
    }

    this.saveToStorage();
    this.render();
  }

  updateQuantity(cartItemId, delta) {
    const item = this.items.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(cartItemId);
    } else {
      this.saveToStorage();
      this.render();
    }
  }

  removeItem(cartItemId) {
    this.items = this.items.filter(i => i.cartItemId !== cartItemId);
    this.saveToStorage();
    this.render();
    if (window.app && window.app.showToast) {
      window.app.showToast('Item removed from your bag.');
    }
  }

  clearCart() {
    this.items = [];
    this.saveToStorage();
    this.render();
  }

  applyPromo(code) {
    const promoMap = {
      'VOGUE15': { discount: 0.15, text: '15% Off Lookbook Bundle' },
      'WELCOME20': { discount: 0.20, text: '20% Off Welcome VIP' },
      'HAUTE10': { discount: 0.10, text: '10% Off Private Client' }
    };

    if (promoMap[code]) {
      this.promoCode = code;
      this.discountPercent = promoMap[code].discount;
      this.render();
      if (window.app && window.app.showToast) {
        window.app.showToast(`Applied ${code}: ${promoMap[code].text}! 🎉`);
      }
    } else {
      if (window.app && window.app.showToast) {
        window.app.showToast(`Invalid promo code. Try "VOGUE15"`);
      }
    }
  }

  calculateTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * this.discountPercent;
    const isFreeShipping = subtotal >= this.freeShippingThreshold || subtotal === 0;
    const shipping = isFreeShipping ? 0 : 25;
    const tax = (subtotal - discountAmount) * 0.08; // 8% sales tax
    const grandTotal = Math.max(0, subtotal - discountAmount + shipping + tax);
    const totalCount = this.items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      subtotal,
      discountAmount,
      shipping,
      tax,
      grandTotal,
      totalCount,
      isFreeShipping,
      remainingForFreeShipping: Math.max(0, this.freeShippingThreshold - subtotal)
    };
  }

  render() {
    const totals = this.calculateTotals();

    // Badges update
    this.cartCountBadges.forEach(badge => {
      badge.textContent = totals.totalCount;
      badge.style.display = totals.totalCount > 0 ? 'inline-flex' : 'none';
    });

    // Subtotal & Totals
    if (this.cartSubtotalEl) {
      this.cartSubtotalEl.textContent = `${this.currencySymbol}${totals.subtotal.toFixed(0)}`;
    }

    if (this.cartDiscountRow && this.cartDiscountEl) {
      if (totals.discountAmount > 0) {
        this.cartDiscountRow.style.display = 'flex';
        this.cartDiscountEl.textContent = `-${this.currencySymbol}${totals.discountAmount.toFixed(0)}`;
      } else {
        this.cartDiscountRow.style.display = 'none';
      }
    }

    if (this.cartTotalEl) {
      this.cartTotalEl.textContent = `${this.currencySymbol}${totals.grandTotal.toFixed(0)}`;
    }

    // Shipping progress bar
    if (this.shippingProgressFill && this.shippingTextEl) {
      if (totals.totalCount === 0) {
        this.shippingProgressFill.style.width = '0%';
        this.shippingTextEl.textContent = `Complimentary express shipping on orders over ${this.currencySymbol}${this.freeShippingThreshold}`;
      } else if (totals.isFreeShipping) {
        this.shippingProgressFill.style.width = '100%';
        this.shippingTextEl.innerHTML = `✨ <strong>Complimentary Worldwide White-Glove Shipping Unlocked!</strong>`;
      } else {
        const percent = Math.min(100, (totals.subtotal / this.freeShippingThreshold) * 100);
        this.shippingProgressFill.style.width = `${percent}%`;
        this.shippingTextEl.innerHTML = `Add <strong>${this.currencySymbol}${totals.remainingForFreeShipping.toFixed(0)}</strong> more to unlock Complimentary White-Glove Shipping.`;
      }
    }

    // Empty state vs Items List
    if (this.cartItemsList && this.cartEmptyState) {
      if (this.items.length === 0) {
        this.cartItemsList.style.display = 'none';
        this.cartEmptyState.style.display = 'flex';
        if (this.btnCheckout) this.btnCheckout.disabled = true;
      } else {
        this.cartItemsList.style.display = 'block';
        this.cartEmptyState.style.display = 'none';
        if (this.btnCheckout) this.btnCheckout.disabled = false;

        this.cartItemsList.innerHTML = this.items.map(item => `
          <div class="cart-item-card" data-id="${item.cartItemId}">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}" />
            </div>
            <div class="cart-item-info">
              <div class="cart-item-top">
                <h4 class="cart-item-name">${item.name}</h4>
                <button class="cart-item-remove" title="Remove item" onclick="window.cart.removeItem('${item.cartItemId}')">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div class="cart-item-specs">
                <span class="spec-size">Size: ${item.size}</span>
                <span class="spec-color-dot" style="background-color: ${item.color};" title="Color"></span>
                ${item.isBundle ? '<span class="spec-bundle-badge">Lookbook Set</span>' : ''}
              </div>

              <div class="cart-item-bottom">
                <div class="qty-counter">
                  <button class="qty-btn" onclick="window.cart.updateQuantity('${item.cartItemId}', -1)">-</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" onclick="window.cart.updateQuantity('${item.cartItemId}', 1)">+</button>
                </div>
                <div class="cart-item-price-calc">
                  ${item.quantity > 1 ? `<span class="unit-price">$${item.price} each</span>` : ''}
                  <span class="item-subtotal">$${(item.price * item.quantity).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  }
}

window.Cart = Cart;

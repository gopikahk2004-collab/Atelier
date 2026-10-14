// ==========================================
// ATELIER LUXE - Interactive Dressing Room Engine
// ==========================================

class DressingRoom {
  constructor() {
    // Current avatar configuration
    this.avatar = {
      gender: 'female',
      skinTone: '#c89b6c', // Olive default
      hairStyle: 'bun',    // 'bun', 'bob', 'waves', 'sculpted'
      hairColor: '#121212',
      size: 'S',           // XS, S, M, L, XL
      lighting: 'runway',  // 'runway', 'golden', 'studio', 'neon'
      zoom: 1
    };

    // Equipped garments by slot
    // slot keys: 'dress', 'top', 'bottom', 'outerwear', 'shoes', 'accessories'
    this.equipped = {
      dress: null,
      top: 'knit-cream-04',
      bottom: 'trouser-pleated-05',
      outerwear: 'blazer-obsidian-01',
      shoes: 'boots-combat-08',
      accessories: 'accessory-sunglasses-10'
    };

    // Custom color overrides for equipped items: { [productId]: hexColor }
    this.customColors = {};

    // History for Undo/Redo or quick reset
    this.savedLooks = [];

    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.renderWardrobeRail();
    this.renderMannequin();
    this.updateEquippedListUI();
    this.updateFitFeedback();
  }

  cacheElements() {
    this.mannequinContainer = document.getElementById('mannequin-container');
    this.lightingBackdrop = document.getElementById('dressing-lighting-backdrop');
    this.wardrobeTabs = document.getElementById('wardrobe-tabs');
    this.wardrobeGrid = document.getElementById('wardrobe-grid');
    this.equippedChipsContainer = document.getElementById('equipped-chips');
    this.totalLookPriceEl = document.getElementById('total-look-price');
    this.addLookToCartBtn = document.getElementById('btn-add-look-cart');
    this.btnAiStylist = document.getElementById('btn-ai-stylist');
    this.btnResetMannequin = document.getElementById('btn-reset-mannequin');
    this.btnSnapshot = document.getElementById('btn-snapshot');
    this.fitMetricEl = document.getElementById('fit-tension-meter');
  }

  bindEvents() {
    // Avatar controls
    document.querySelectorAll('[data-skintone]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-skintone]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.avatar.skinTone = btn.dataset.skintone;
        this.renderMannequin();
      });
    });

    document.querySelectorAll('[data-hairstyle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-hairstyle]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.avatar.hairStyle = btn.dataset.hairstyle;
        this.renderMannequin();
      });
    });

    document.querySelectorAll('[data-haircolor]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-haircolor]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.avatar.hairColor = btn.dataset.haircolor;
        this.renderMannequin();
      });
    });

    document.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-size]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.avatar.size = btn.dataset.size;
        this.renderMannequin();
        this.updateFitFeedback();
      });
    });

    document.querySelectorAll('[data-lighting]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-lighting]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setLighting(btn.dataset.lighting);
      });
    });

    // Wardrobe category tabs
    if (this.wardrobeTabs) {
      this.wardrobeTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.wardrobe-tab');
        if (!tab) return;
        document.querySelectorAll('.wardrobe-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderWardrobeRail(tab.dataset.category);
      });
    }

    // AI Stylist button
    if (this.btnAiStylist) {
      this.btnAiStylist.addEventListener('click', () => this.applyRandomCuratedStyle());
    }

    // Reset Mannequin
    if (this.btnResetMannequin) {
      this.btnResetMannequin.addEventListener('click', () => this.clearAllGarments());
    }

    // Add Look to Cart
    if (this.addLookToCartBtn) {
      this.addLookToCartBtn.addEventListener('click', () => this.addEquippedLookToCart());
    }

    // Snapshot button
    if (this.btnSnapshot) {
      this.btnSnapshot.addEventListener('click', () => this.generateSnapshot());
    }
  }

  setLighting(mode) {
    this.avatar.lighting = mode;
    if (this.lightingBackdrop) {
      this.lightingBackdrop.className = `dressing-lighting-backdrop lighting-${mode}`;
    }
  }

  equipGarment(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    // Handle dress vs top/bottom collision
    if (product.dressingSlot === 'dress') {
      this.equipped.dress = product.id;
      this.equipped.top = null;
      this.equipped.bottom = null;
    } else if (product.dressingSlot === 'top') {
      this.equipped.top = product.id;
      this.equipped.dress = null;
    } else if (product.dressingSlot === 'bottom') {
      this.equipped.bottom = product.id;
      this.equipped.dress = null;
    } else {
      this.equipped[product.dressingSlot] = product.id;
    }

    // Reset color to default for this product if not set
    if (!this.customColors[productId]) {
      this.customColors[productId] = product.defaultColor;
    }

    this.renderMannequin();
    this.updateEquippedListUI();
    this.renderWardrobeRail(); // update active state on cards
    this.triggerDrapeAnimation();
    this.showToast(`Equipped: ${product.name}`);
  }

  unequipGarment(slot) {
    if (!this.equipped[slot]) return;
    const item = PRODUCTS_DATA.find(p => p.id === this.equipped[slot]);
    this.equipped[slot] = null;
    this.renderMannequin();
    this.updateEquippedListUI();
    this.renderWardrobeRail();
    if (item) this.showToast(`Removed: ${item.name}`);
  }

  clearAllGarments() {
    this.equipped = {
      dress: null,
      top: null,
      bottom: null,
      outerwear: null,
      shoes: null,
      accessories: null
    };
    this.renderMannequin();
    this.updateEquippedListUI();
    this.renderWardrobeRail();
    this.showToast('Mannequin reset to base layer.');
  }

  applyRandomCuratedStyle() {
    const randomBundle = CURATED_STYLES[Math.floor(Math.random() * CURATED_STYLES.length)];
    this.clearAllGarments();

    randomBundle.items.forEach(id => {
      const product = PRODUCTS_DATA.find(p => p.id === id);
      if (product) {
        if (product.dressingSlot === 'dress') {
          this.equipped.dress = product.id;
        } else {
          this.equipped[product.dressingSlot] = product.id;
        }
      }
    });

    if (randomBundle.lighting) {
      this.setLighting(randomBundle.lighting);
      const lightingBtn = document.querySelector(`[data-lighting="${randomBundle.lighting}"]`);
      if (lightingBtn) {
        document.querySelectorAll('[data-lighting]').forEach(b => b.classList.remove('active'));
        lightingBtn.classList.add('active');
      }
    }

    this.renderMannequin();
    this.updateEquippedListUI();
    this.renderWardrobeRail();
    this.triggerDrapeAnimation();

    this.showToast(`AI Stylist: Applied "${randomBundle.name}" ✨`);
  }

  setGarmentColor(productId, hex) {
    this.customColors[productId] = hex;
    this.renderMannequin();
  }

  triggerDrapeAnimation() {
    const svg = document.getElementById('interactive-avatar-svg');
    if (svg) {
      svg.classList.remove('drape-pulse');
      void svg.offsetWidth; // trigger reflow
      svg.classList.add('drape-pulse');
    }
  }

  getEquippedItemsList() {
    const list = [];
    Object.keys(this.equipped).forEach(slot => {
      const id = this.equipped[slot];
      if (id) {
        const prod = PRODUCTS_DATA.find(p => p.id === id);
        if (prod) list.push({ slot, product: prod });
      }
    });
    return list;
  }

  calculateLookTotal() {
    const items = this.getEquippedItemsList();
    const subtotal = items.reduce((sum, item) => sum + item.product.price, 0);
    // 15% complete look discount if at least 2 items equipped
    const discount = items.length >= 2 ? subtotal * 0.15 : 0;
    return {
      subtotal,
      discount,
      total: subtotal - discount,
      count: items.length
    };
  }

  updateEquippedListUI() {
    if (!this.equippedChipsContainer) return;
    const items = this.getEquippedItemsList();
    const pricing = this.calculateLookTotal();

    if (items.length === 0) {
      this.equippedChipsContainer.innerHTML = `
        <div class="empty-equipped-notice">
          <span>Mannequin in base attire. Select pieces from the wardrobe or click "AI Stylist" to compose a look.</span>
        </div>
      `;
    } else {
      this.equippedChipsContainer.innerHTML = items.map(({ slot, product }) => {
        const currentColor = this.customColors[product.id] || product.defaultColor;
        return `
          <div class="equipped-chip" data-slot="${slot}">
            <div class="chip-color-dot" style="background-color: ${currentColor};" title="Tint: ${currentColor}"></div>
            <div class="chip-details">
              <span class="chip-slot">${slot.toUpperCase()}</span>
              <span class="chip-name">${product.name}</span>
            </div>
            <span class="chip-price">$${product.price}</span>
            <div class="chip-actions">
              <button class="chip-remove-btn" title="Remove" onclick="window.dressingRoom.unequipGarment('${slot}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    if (this.totalLookPriceEl) {
      if (pricing.count >= 2) {
        this.totalLookPriceEl.innerHTML = `
          <div class="look-price-breakdown">
            <span class="look-original-price">$${pricing.subtotal.toFixed(0)}</span>
            <span class="look-discounted-price">$${pricing.total.toFixed(0)}</span>
            <span class="look-bundle-tag">15% Lookbook Bundle</span>
          </div>
        `;
      } else {
        this.totalLookPriceEl.innerHTML = `
          <div class="look-price-breakdown">
            <span class="look-discounted-price">$${pricing.total.toFixed(0)}</span>
          </div>
        `;
      }
    }

    if (this.addLookToCartBtn) {
      this.addLookToCartBtn.disabled = items.length === 0;
    }
  }

  updateFitFeedback() {
    if (!this.fitMetricEl) return;
    const sizeDescriptions = {
      'XS': { label: 'Slim Form-Fitting', tension: '94% Compression', alert: 'Sculpted contours' },
      'S': { label: 'Tailored Editorial Fit', tension: '100% True to Size', alert: 'Optimal mannequin drape' },
      'M': { label: 'Relaxed Silhouette', tension: '105% Comfort Flow', alert: 'Effortless fluid movement' },
      'L': { label: 'Curated Oversized Drape', tension: '112% Volume Drape', alert: 'Architectural street drape' },
      'XL': { label: 'Cocoon Statement Fit', tension: '118% Statement Cut', alert: 'Bold oversized proportion' }
    };

    const current = sizeDescriptions[this.avatar.size] || sizeDescriptions['S'];
    this.fitMetricEl.innerHTML = `
      <div class="fit-tension-card">
        <div class="fit-tension-header">
          <span class="fit-size-badge">Size ${this.avatar.size}</span>
          <span class="fit-status-text">${current.label}</span>
        </div>
        <div class="fit-progress-bar">
          <div class="fit-progress-fill" style="width: ${parseInt(current.tension)}%;"></div>
        </div>
        <div class="fit-tension-meta">
          <span>${current.tension}</span>
          <span class="fit-tension-highlight">${current.alert}</span>
        </div>
      </div>
    `;
  }

  addEquippedLookToCart() {
    const items = this.getEquippedItemsList();
    if (items.length === 0) return;

    items.forEach(({ product }) => {
      const selectedColor = this.customColors[product.id] || product.defaultColor;
      window.cart.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: this.avatar.size,
        color: selectedColor,
        isBundle: items.length >= 2
      });
    });

    if (items.length >= 2) {
      window.cart.applyPromo('VOGUE15');
      this.showToast(`All ${items.length} garments added with 15% Complete Look discount! 🛍️`);
    } else {
      this.showToast(`Added ${items[0].product.name} to cart! 🛍️`);
    }

    window.cart.openDrawer();
  }

  renderWardrobeRail(filterCategory = 'all') {
    if (!this.wardrobeGrid) return;

    let filtered = PRODUCTS_DATA;
    if (filterCategory !== 'all') {
      filtered = PRODUCTS_DATA.filter(p => p.category === filterCategory);
    }

    this.wardrobeGrid.innerHTML = filtered.map(product => {
      const isEquipped = Object.values(this.equipped).includes(product.id);
      const currentColor = this.customColors[product.id] || product.defaultColor;

      return `
        <div class="wardrobe-card ${isEquipped ? 'is-wearing' : ''}" data-id="${product.id}">
          <div class="wardrobe-card-thumb">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
            <span class="wardrobe-card-category">${product.category}</span>
            ${isEquipped ? '<span class="wearing-badge">Worn</span>' : ''}
          </div>
          <div class="wardrobe-card-info">
            <h4 class="wardrobe-card-title">${product.name}</h4>
            <div class="wardrobe-card-price-row">
              <span class="wardrobe-price">$${product.price}</span>
              ${product.originalPrice ? `<span class="wardrobe-orig-price">$${product.originalPrice}</span>` : ''}
            </div>
            
            <div class="wardrobe-card-swatches">
              ${product.colors.map(col => `
                <button class="color-swatch-dot ${col.hex === currentColor ? 'selected' : ''}" 
                  style="background-color: ${col.hex};" 
                  title="${col.name}"
                  onclick="event.stopPropagation(); window.dressingRoom.setGarmentColor('${product.id}', '${col.hex}')">
                </button>
              `).join('')}
            </div>

            <div class="wardrobe-card-buttons">
              <button class="btn-try-on ${isEquipped ? 'active' : ''}" 
                onclick="window.dressingRoom.equipGarment('${product.id}')">
                ${isEquipped ? 'Draped ✓' : 'Try On'}
              </button>
              <button class="btn-quick-inspect" title="Inspect details" onclick="window.app.openProductModal('${product.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  generateSnapshot() {
    const items = this.getEquippedItemsList();
    if (items.length === 0) {
      this.showToast('Dress your mannequin first before taking a snapshot!');
      return;
    }

    const modal = document.getElementById('snapshot-modal');
    const content = document.getElementById('snapshot-modal-body');
    if (!modal || !content) return;

    const svgContent = document.getElementById('interactive-avatar-svg').outerHTML;
    const lookName = `Atelier Haute Couture #${Math.floor(1000 + Math.random() * 9000)}`;

    content.innerHTML = `
      <div class="snapshot-card">
        <div class="snapshot-header">
          <div class="brand-crest">ATELIER LUXE</div>
          <div class="snapshot-meta">PARIS • MILAN • TOKYO • NEW YORK</div>
        </div>
        <div class="snapshot-visual">
          ${svgContent}
        </div>
        <div class="snapshot-footer">
          <h3 class="snapshot-look-title">${lookName}</h3>
          <div class="snapshot-tags">
            ${items.map(i => `<span class="tag-pill">${i.product.name}</span>`).join('')}
          </div>
          <div class="snapshot-signature">CURATED BY ATELIER AI VIRTUAL STUDIO</div>
        </div>
      </div>
      <div class="snapshot-dialog-actions">
        <button class="btn-primary" onclick="window.dressingRoom.saveLookToLookbook('${lookName}')">
          Save to Lookbook ❤️
        </button>
        <button class="btn-secondary" onclick="window.dressingRoom.closeSnapshotModal()">
          Close
        </button>
      </div>
    `;

    modal.classList.add('open');
  }

  closeSnapshotModal() {
    const modal = document.getElementById('snapshot-modal');
    if (modal) modal.classList.remove('open');
  }

  saveLookToLookbook(name) {
    const items = this.getEquippedItemsList();
    this.savedLooks.push({
      id: Date.now(),
      name,
      items: items.map(i => i.product),
      date: new Date().toLocaleDateString(),
      avatar: { ...this.avatar },
      equipped: { ...this.equipped }
    });
    this.closeSnapshotModal();
    this.showToast(`Saved "${name}" to your private lookbook! ✨`);
    if (window.app && window.app.renderLookbook) {
      window.app.renderLookbook();
    }
  }

  showToast(message) {
    if (window.app && window.app.showToast) {
      window.app.showToast(message);
    }
  }

  // ==========================================
  // DYNAMIC SVG VECTOR MANNEQUIN & GARMENT ENGINE
  // ==========================================
  renderMannequin() {
    if (!this.mannequinContainer) return;

    const { skinTone, hairStyle, hairColor, size } = this.avatar;

    // Body scale based on size selection
    const sizeScaleMap = {
      'XS': { scaleX: 0.96, scaleY: 0.98, hipWidth: 26, waistWidth: 20 },
      'S': { scaleX: 1.0, scaleY: 1.0, hipWidth: 28, waistWidth: 22 },
      'M': { scaleX: 1.05, scaleY: 1.0, hipWidth: 31, waistWidth: 24.5 },
      'L': { scaleX: 1.10, scaleY: 1.0, hipWidth: 34, waistWidth: 27 },
      'XL': { scaleX: 1.16, scaleY: 1.0, hipWidth: 38, waistWidth: 30 }
    };
    const currentScale = sizeScaleMap[size] || sizeScaleMap['S'];

    // Garment color helpers
    const getColor = (slot) => {
      const prodId = this.equipped[slot];
      if (!prodId) return '#1a1a1a';
      return this.customColors[prodId] || (PRODUCTS_DATA.find(p => p.id === prodId)?.defaultColor || '#1a1a1a');
    };

    const hasDress = !!this.equipped.dress;
    const hasTop = !!this.equipped.top;
    const hasBottom = !!this.equipped.bottom;
    const hasOuterwear = !!this.equipped.outerwear;
    const hasShoes = !!this.equipped.shoes;
    const hasAccessories = !!this.equipped.accessories;

    // Generate Hair Paths
    let hairSVG = '';
    if (hairStyle === 'bun') {
      hairSVG = `
        <!-- High Chic Sculpted Bun -->
        <circle cx="200" cy="80" r="28" fill="${hairColor}" />
        <path d="M174 125 C170 100 185 85 200 85 C215 85 230 100 226 125 C220 110 215 105 200 105 C185 105 180 110 174 125 Z" fill="${hairColor}" />
      `;
    } else if (hairStyle === 'bob') {
      hairSVG = `
        <!-- Razor-Sharp Architectural Bob -->
        <path d="M170 115 C170 90 180 80 200 80 C220 80 230 90 230 115 C235 145 230 160 225 170 L212 165 C214 150 215 130 200 125 C185 130 186 150 188 165 L175 170 C170 160 165 145 170 115 Z" fill="${hairColor}" />
      `;
    } else if (hairStyle === 'waves') {
      hairSVG = `
        <!-- Editorial Flowing Waves -->
        <path d="M168 115 C168 85 180 75 200 75 C220 75 232 85 232 115 C236 140 245 180 240 215 C235 200 225 190 218 160 C210 135 210 120 200 120 C190 120 190 135 182 160 C175 190 165 200 160 215 C155 180 164 140 168 115 Z" fill="${hairColor}" />
      `;
    } else {
      hairSVG = `
        <!-- Sculpted High Puff -->
        <ellipse cx="200" cy="72" rx="36" ry="32" fill="${hairColor}" />
        <circle cx="178" cy="80" r="14" fill="${hairColor}" />
        <circle cx="222" cy="80" r="14" fill="${hairColor}" />
        <path d="M175 120 C175 100 185 90 200 90 C215 90 225 100 225 120 C220 112 215 108 200 108 C185 108 180 112 175 120 Z" fill="${hairColor}" />
      `;
    }

    // Garment SVG Elements
    // 1. Dress Layer
    let dressSVG = '';
    if (hasDress) {
      const dressColor = getColor('dress');
      if (this.equipped.dress === 'dress-emerald-02') {
        dressSVG = `
          <!-- Aurelia Draped Silk Gown -->
          <g class="garment-layer" id="svg-layer-dress" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
            <!-- Draped Asymmetric Bodice -->
            <path d="M165 185 C175 180 195 200 200 205 C208 200 225 175 235 185 C230 215 224 245 220 270 C212 272 188 272 180 270 C176 245 170 215 165 185 Z" fill="${dressColor}" />
            <path d="M165 185 L180 148 L200 170 L220 148 L235 185 Z" fill="${dressColor}" opacity="0.9" />
            <!-- Fluid Draped Skirt with Slit -->
            <path d="M180 270 C175 330 160 410 150 490 C165 495 195 498 215 495 C210 440 215 380 220 340 L225 390 C235 440 245 480 250 490 C258 495 270 490 265 440 C260 380 240 320 220 270 Z" fill="${dressColor}" />
            <!-- Draped silk folds & highlights -->
            <path d="M195 210 Q198 250 188 320" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" />
            <path d="M210 270 Q215 360 230 460" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" fill="none" />
            <path d="M178 275 Q168 370 156 470" stroke="rgba(0,0,0,0.25)" stroke-width="2" fill="none" />
          </g>
        `;
      }
    }

    // 2. Top Layer
    let topSVG = '';
    if (hasTop && !hasDress) {
      const topColor = getColor('top');
      if (this.equipped.top === 'knit-cream-04') {
        topSVG = `
          <!-- Geneva Cashmere Ribbed Mockneck -->
          <g class="garment-layer" id="svg-layer-top" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));">
            <!-- Mockneck collar -->
            <rect x="186" y="140" width="28" height="18" rx="4" fill="${topColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1" />
            <!-- Sleeves & Chest -->
            <path d="M186 156 L152 178 L142 270 L158 272 L168 205 L178 265 L222 265 L232 205 L242 272 L258 270 L248 178 L214 156 Z" fill="${topColor}" />
            <!-- Knit ribbing texture lines -->
            <line x1="192" y1="140" x2="192" y2="158" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" />
            <line x1="198" y1="140" x2="198" y2="158" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" />
            <line x1="204" y1="140" x2="204" y2="158" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" />
            <line x1="200" y1="165" x2="200" y2="265" stroke="rgba(0,0,0,0.08)" stroke-width="2" />
          </g>
        `;
      } else if (this.equipped.top === 'corset-leather-06') {
        topSVG = `
          <!-- Nocturne Sculpted Leather Bustier -->
          <g class="garment-layer" id="svg-layer-top" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
            <path d="M172 175 C180 168 190 185 200 178 C210 185 220 168 228 175 L224 252 C212 258 188 258 176 252 Z" fill="${topColor}" />
            <!-- Underwire & Boning Architecture -->
            <path d="M174 182 Q185 205 198 185" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none" />
            <path d="M202 185 Q215 205 226 182" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none" />
            <line x1="200" y1="188" x2="200" y2="255" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
            <line x1="186" y1="195" x2="186" y2="252" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
            <line x1="214" y1="195" x2="214" y2="252" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
          </g>
        `;
      }
    }

    // 3. Bottom Layer
    let bottomSVG = '';
    if (hasBottom && !hasDress) {
      const bottomColor = getColor('bottom');
      if (this.equipped.bottom === 'trouser-pleated-05') {
        bottomSVG = `
          <!-- Vittorio Pleated Wide-Leg Trousers -->
          <g class="garment-layer" id="svg-layer-bottom" style="filter: drop-shadow(0 6px 10px rgba(0,0,0,0.3));">
            <!-- High waistband -->
            <rect x="176" y="250" width="48" height="14" rx="2" fill="${bottomColor}" />
            <!-- Legs with fluid flare -->
            <path d="M176 264 L162 470 L195 470 L200 325 L205 470 L238 470 L224 264 Z" fill="${bottomColor}" />
            <!-- Inverted Pleats & Creases -->
            <line x1="187" y1="264" x2="178" y2="470" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
            <line x1="213" y1="264" x2="222" y2="470" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
          </g>
        `;
      } else if (this.equipped.bottom === 'skirt-satin-07') {
        bottomSVG = `
          <!-- Calliope Bias-Cut Satin Midi Skirt -->
          <g class="garment-layer" id="svg-layer-bottom" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));">
            <path d="M178 252 L164 425 C176 435 224 435 236 425 L222 252 Z" fill="${bottomColor}" />
            <!-- Satin drape reflections -->
            <path d="M188 256 Q194 340 180 422" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none" />
            <path d="M212 256 Q208 340 220 422" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none" />
          </g>
        `;
      }
    }

    // 4. Outerwear Layer (Blazer or Trench)
    let outerwearSVG = '';
    if (hasOuterwear) {
      const outerwearColor = getColor('outerwear');
      if (this.equipped.outerwear === 'blazer-obsidian-01') {
        outerwearSVG = `
          <!-- Obsidian Satin-Lapel Tailored Blazer -->
          <g class="garment-layer" id="svg-layer-outerwear" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.45));">
            <!-- Sleeves -->
            <path d="M148 168 L134 275 L150 278 L162 205 Z" fill="${outerwearColor}" />
            <path d="M252 168 L266 275 L250 278 L238 205 Z" fill="${outerwearColor}" />
            <!-- Blazer Body Panels -->
            <path d="M160 168 L170 285 L196 285 L182 200 Z" fill="${outerwearColor}" />
            <path d="M240 168 L230 285 L204 285 L218 200 Z" fill="${outerwearColor}" />
            <!-- Lustrous Duchess Satin Peak Lapels -->
            <polygon points="172,168 194,228 178,228 166,192" fill="#1b1c20" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" />
            <polygon points="228,168 206,228 222,228 234,192" fill="#1b1c20" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" />
            <!-- Buttons & pocket welts -->
            <circle cx="200" cy="235" r="3" fill="#d4af37" />
            <circle cx="200" cy="252" r="3" fill="#d4af37" />
            <line x1="172" y1="260" x2="186" y2="260" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
            <line x1="214" y1="260" x2="228" y2="260" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
          </g>
        `;
      } else if (this.equipped.outerwear === 'coat-caramel-03') {
        outerwearSVG = `
          <!-- Sienna Oversized Leather Trench Coat -->
          <g class="garment-layer" id="svg-layer-outerwear" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));">
            <!-- Broad Storm-Flap Shoulders & Sleeves -->
            <path d="M144 165 L130 285 L150 288 L162 210 Z" fill="${outerwearColor}" />
            <path d="M256 165 L270 285 L250 288 L238 210 Z" fill="${outerwearColor}" />
            <!-- Full Long Trench Coat Body -->
            <path d="M160 165 L150 445 L250 445 L240 165 Z" fill="${outerwearColor}" />
            <!-- Wide Double-Breasted Lapels -->
            <polygon points="168,165 198,245 174,235" fill="${outerwearColor}" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
            <polygon points="232,165 202,245 226,235" fill="${outerwearColor}" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
            <!-- Cinched Waist Tie Belt -->
            <rect x="168" y="258" width="64" height="12" rx="2" fill="#5c361c" />
            <rect x="194" y="255" width="12" height="18" rx="2" fill="#d4af37" />
            <!-- Storm flap detail -->
            <path d="M210 170 L238 170 L234 205 Z" fill="${outerwearColor}" stroke="rgba(0,0,0,0.25)" />
          </g>
        `;
      }
    }

    // 5. Shoes Layer
    let shoesSVG = '';
    if (hasShoes) {
      const shoesColor = getColor('shoes');
      if (this.equipped.shoes === 'boots-combat-08') {
        shoesSVG = `
          <!-- Titan Lug-Sole Monolith Boots -->
          <g class="garment-layer" id="svg-layer-shoes" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
            <!-- Left Boot -->
            <path d="M168 458 L158 495 L182 495 L184 458 Z" fill="${shoesColor}" />
            <!-- Left Chunky Tread Sole -->
            <rect x="154" y="493" width="32" height="10" rx="3" fill="#080808" />
            <line x1="160" y1="500" x2="160" y2="503" stroke="#fff" stroke-width="1" />
            <line x1="168" y1="500" x2="168" y2="503" stroke="#fff" stroke-width="1" />
            <line x1="176" y1="500" x2="176" y2="503" stroke="#fff" stroke-width="1" />

            <!-- Right Boot -->
            <path d="M216 458 L218 495 L242 495 L232 458 Z" fill="${shoesColor}" />
            <!-- Right Chunky Tread Sole -->
            <rect x="214" y="493" width="32" height="10" rx="3" fill="#080808" />
            <line x1="220" y1="500" x2="220" y2="503" stroke="#fff" stroke-width="1" />
            <line x1="228" y1="500" x2="228" y2="503" stroke="#fff" stroke-width="1" />
            <line x1="236" y1="500" x2="236" y2="503" stroke="#fff" stroke-width="1" />
          </g>
        `;
      } else if (this.equipped.shoes === 'heels-stiletto-09') {
        shoesSVG = `
          <!-- Sirena Minimalist Strap Heels -->
          <g class="garment-layer" id="svg-layer-shoes">
            <!-- Left Heel -->
            <path d="M166 480 L166 500 L178 500 L176 480 Z" fill="${skinTone}" />
            <line x1="167" y1="486" x2="167" y2="502" stroke="${shoesColor}" stroke-width="2.5" />
            <path d="M164 498 Q174 492 182 500" stroke="${shoesColor}" stroke-width="3" fill="none" />
            <line x1="165" y1="482" x2="175" y2="482" stroke="${shoesColor}" stroke-width="2" />

            <!-- Right Heel -->
            <path d="M224 480 L222 500 L234 500 L234 480 Z" fill="${skinTone}" />
            <line x1="233" y1="486" x2="233" y2="502" stroke="${shoesColor}" stroke-width="2.5" />
            <path d="M218 500 Q226 492 236 498" stroke="${shoesColor}" stroke-width="3" fill="none" />
            <line x1="225" y1="482" x2="235" y2="482" stroke="${shoesColor}" stroke-width="2" />
          </g>
        `;
      }
    }

    // 6. Accessories Layer
    let accessoriesSVG = '';
    if (hasAccessories) {
      const accColor = getColor('accessories');
      if (this.equipped.accessories === 'accessory-sunglasses-10') {
        accessoriesSVG = `
          <!-- Matrix Geometric Shield Eyewear -->
          <g class="garment-layer" id="svg-layer-sunglasses" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
            <polygon points="182,122 196,124 194,132 180,128" fill="${accColor}" stroke="#d4af37" stroke-width="0.7" />
            <polygon points="204,124 218,122 220,128 206,132" fill="${accColor}" stroke="#d4af37" stroke-width="0.7" />
            <line x1="196" y1="124" x2="204" y2="124" stroke="#d4af37" stroke-width="1.2" />
          </g>
        `;
      } else if (this.equipped.accessories === 'bag-crossbody-11') {
        accessoriesSVG = `
          <!-- Palazzo Sculpted Flap Bag -->
          <g class="garment-layer" id="svg-layer-bag" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));">
            <!-- Sliding Chain Strap -->
            <path d="M174 165 C176 220 230 280 234 310" stroke="#d4af37" stroke-width="1.8" stroke-dasharray="2 1" fill="none" />
            <!-- Bag Flap & Body -->
            <path d="M226 295 L252 295 L256 325 L222 325 Z" fill="${accColor}" />
            <polygon points="226,295 252,295 239,310" fill="${accColor}" stroke="rgba(0,0,0,0.2)" stroke-width="1" />
            <!-- Gilded signature clasp -->
            <circle cx="239" cy="308" r="2.5" fill="#d4af37" />
          </g>
        `;
      }
    }

    // Full SVG Construction
    this.mannequinContainer.innerHTML = `
      <svg id="interactive-avatar-svg" viewBox="0 0 400 560" class="mannequin-svg">
        <defs>
          <radialGradient id="mannequin-pedestal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#c9a96e" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#c9a96e" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="body-shade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#000" stop-opacity="0.12" />
            <stop offset="50%" stop-color="#fff" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#000" stop-opacity="0.18" />
          </linearGradient>
        </defs>

        <!-- Mirrored Pedestal Platform -->
        <ellipse cx="200" cy="515" rx="100" ry="24" fill="url(#mannequin-pedestal-glow)" />
        <ellipse cx="200" cy="515" rx="72" ry="12" fill="#141416" stroke="rgba(201, 169, 110, 0.4)" stroke-width="1.5" />

        <!-- Mannequin Avatar Base -->
        <g id="avatar-model-group" transform="translate(${200 * (1 - currentScale.scaleX)}, 0) scale(${currentScale.scaleX}, ${currentScale.scaleY})">
          
          <!-- Silhouette Legs & Feet -->
          <g id="avatar-legs">
            <!-- Left Leg -->
            <path d="M178 280 L168 475 L182 475 L192 310 Z" fill="${skinTone}" />
            <!-- Right Leg -->
            <path d="M222 280 L232 475 L218 475 L208 310 Z" fill="${skinTone}" />
          </g>

          <!-- Silhouette Torso & Chest -->
          <g id="avatar-torso">
            <path d="M170 162 C168 185 178 240 180 280 C190 284 210 284 220 280 C222 240 232 185 230 162 C218 160 182 160 170 162 Z" fill="${skinTone}" />
            <!-- Torso shading overlay -->
            <path d="M170 162 C168 185 178 240 180 280 C190 284 210 284 220 280 C222 240 232 185 230 162 Z" fill="url(#body-shade)" />
            <!-- Collarbone accent -->
            <path d="M184 158 Q192 165 200 160 Q208 165 216 158" stroke="rgba(0,0,0,0.15)" stroke-width="1" fill="none" />
          </g>

          <!-- Silhouette Arms & Hands -->
          <g id="avatar-arms">
            <!-- Left Arm -->
            <path d="M168 164 L146 265 L154 266 L174 180 Z" fill="${skinTone}" />
            <!-- Right Arm (relaxed chic posture) -->
            <path d="M232 164 L254 265 L246 266 L226 180 Z" fill="${skinTone}" />
          </g>

          <!-- Silhouette Neck & Face -->
          <g id="avatar-head">
            <!-- Neck -->
            <path d="M192 135 L190 162 L210 162 L208 135 Z" fill="${skinTone}" />
            <!-- Jawline & Head -->
            <ellipse cx="200" cy="120" rx="18" ry="22" fill="${skinTone}" />
            <!-- Lip accent -->
            <path d="M196 130 Q200 133 204 130" stroke="#a34b4b" stroke-width="1.4" fill="none" />
          </g>

          <!-- Hair Layer -->
          <g id="avatar-hair">
            ${hairSVG}
          </g>

          <!-- ================= GARMENT LAYERS ================= -->
          <!-- 1. Bottoms -->
          ${bottomSVG}

          <!-- 2. Tops -->
          ${topSVG}

          <!-- 3. One-Piece Dress (if equipped) -->
          ${dressSVG}

          <!-- 4. Shoes -->
          ${shoesSVG}

          <!-- 5. Outerwear -->
          ${outerwearSVG}

          <!-- 6. Accessories -->
          ${accessoriesSVG}

        </g>
      </svg>
    `;
  }
}

window.DressingRoom = DressingRoom;

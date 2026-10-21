/**
 * RianTheSloth - Main Application Logic
 * Integrates F-01 through F-06
 */

import {
  formatRupiah,
  calculateTieredDiscount,
  comparePriceWithLastMonth,
  evaluateBudgetCap,
  compareUnitPrices
} from './calculator.js';

import {
  initStorage,
  getBudgetCap,
  setBudgetCap,
  getCatalog,
  saveCatalog,
  getCart,
  saveCart,
  getHistory,
  archiveCurrentShoppingTrip,
  resetDataToDefaults,
  exportDatabaseJSON,
  importDatabaseJSON
} from './storage.js';

// ===================================================================
// AUDIO SYNTHESIZER (Web Audio API)
// ===================================================================
class SoundFx {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playBeep(freq = 600, type = 'sine', duration = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  playSuccess() {
    this.playBeep(520, 'triangle', 0.08);
    setTimeout(() => this.playBeep(780, 'triangle', 0.12), 80);
  }

  playWarning() {
    this.playBeep(320, 'sawtooth', 0.15);
    setTimeout(() => this.playBeep(260, 'sawtooth', 0.25), 160);
  }

  playDanger() {
    this.playBeep(220, 'square', 0.2);
    setTimeout(() => this.playBeep(180, 'square', 0.25), 200);
  }
}

const sfx = new SoundFx();

// ===================================================================
// APP STATE
// ===================================================================
const state = {
  budgetCap: 300000,
  cart: [],
  catalog: [],
  history: [],
  editingItemId: null,
  activeTab: 'tab-cart'
};

// ===================================================================
// DOM ELEMENTS
// ===================================================================
const els = {
  // Cap Elements
  safetyCapCard: document.getElementById('safetyCapDashboard'),
  safetyCapBadge: document.getElementById('safetyCapBadge'),
  capTotalSpent: document.getElementById('capTotalSpent'),
  capSavingsSub: document.getElementById('capSavingsSub'),
  capBudgetLimit: document.getElementById('capBudgetLimit'),
  capRemaining: document.getElementById('capRemaining'),
  capPercentText: document.getElementById('capPercentText'),
  capProgressBar: document.getElementById('capProgressBar'),
  capAdviceBanner: document.getElementById('capAdviceBanner'),
  capAdviceIcon: document.getElementById('capAdviceIcon'),
  capAdviceText: document.getElementById('capAdviceText'),
  cartItemsMiniCount: document.getElementById('cartItemsMiniCount'),

  // Tabs
  navBtns: document.querySelectorAll('.nav-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  tabCartBadge: document.getElementById('tabCartBadge'),

  // Cart
  stapleChipsContainer: document.getElementById('stapleChipsContainer'),
  cartItemsContainer: document.getElementById('cartItemsContainer'),
  emptyCartState: document.getElementById('emptyCartState'),
  cartHeaderCount: document.getElementById('cartHeaderCount'),
  cartCheckoutBar: document.getElementById('cartCheckoutBar'),
  btnOpenAddModal: document.getElementById('btnOpenAddModal'),
  btnEmptyAdd: document.getElementById('btnEmptyAdd'),
  btnClearCart: document.getElementById('btnClearCart'),
  btnFinishTrip: document.getElementById('btnFinishTrip'),
  btnSortByPrice: document.getElementById('btnSortByPrice'),

  // Modals
  itemModal: document.getElementById('itemModal'),
  itemForm: document.getElementById('itemForm'),
  itemModalTitle: document.getElementById('itemModalTitle'),
  btnCloseItemModal: document.getElementById('btnCloseItemModal'),
  btnCancelItemModal: document.getElementById('btnCancelItemModal'),
  formItemId: document.getElementById('formItemId'),
  formItemName: document.getElementById('formItemName'),
  formItemCategory: document.getElementById('formItemCategory'),
  formItemUnit: document.getElementById('formItemUnit'),
  formItemQty: document.getElementById('formItemQty'),
  formItemPrice: document.getElementById('formItemPrice'),
  formItemDiscount: document.getElementById('formItemDiscount'),
  formItemLastPrice: document.getElementById('formItemLastPrice'),
  formPreviewBanner: document.getElementById('formPreviewBanner'),
  formPreviewText: document.getElementById('formPreviewText'),

  budgetModal: document.getElementById('budgetModal'),
  btnEditBudget: document.getElementById('btnEditBudget'),
  btnCloseBudgetModal: document.getElementById('btnCloseBudgetModal'),
  btnCancelBudgetModal: document.getElementById('btnCancelBudgetModal'),
  btnSaveBudgetModal: document.getElementById('btnSaveBudgetModal'),
  inputNewBudget: document.getElementById('inputNewBudget'),

  receiptModal: document.getElementById('receiptModal'),
  btnCloseReceiptModal: document.getElementById('btnCloseReceiptModal'),
  btnDoneReceipt: document.getElementById('btnDoneReceipt'),
  btnPrintReceipt: document.getElementById('btnPrintReceipt'),
  recNo: document.getElementById('recNo'),
  recDate: document.getElementById('recDate'),
  recTime: document.getElementById('recTime'),
  recTableBody: document.getElementById('recTableBody'),
  recGrandTotal: document.getElementById('recGrandTotal'),
  recTotalSavings: document.getElementById('recTotalSavings'),
  recBudgetCap: document.getElementById('recBudgetCap'),
  recChangeMoney: document.getElementById('recChangeMoney'),

  // Calc Tab
  calcBasePrice: document.getElementById('calcBasePrice'),
  calcDiscountInput: document.getElementById('calcDiscountInput'),
  calcBreakdownBox: document.getElementById('calcBreakdownBox'),
  calcFinalPriceDisplay: document.getElementById('calcFinalPriceDisplay'),
  calcSavingsBadge: document.getElementById('calcSavingsBadge'),
  btnTransferToCart: document.getElementById('btnTransferToCart'),

  // Unit Battle
  optAName: document.getElementById('optAName'),
  optAPrice: document.getElementById('optAPrice'),
  optAVolume: document.getElementById('optAVolume'),
  optAUnit: document.getElementById('optAUnit'),
  optARate: document.getElementById('optARate'),
  boxOptionA: document.getElementById('boxOptionA'),

  optBName: document.getElementById('optBName'),
  optBPrice: document.getElementById('optBPrice'),
  optBVolume: document.getElementById('optBVolume'),
  optBUnit: document.getElementById('optBUnit'),
  optBRate: document.getElementById('optBRate'),
  boxOptionB: document.getElementById('boxOptionB'),
  unitBattleSummary: document.getElementById('unitBattleSummary'),

  // History & Receipts
  historyCardsContainer: document.getElementById('historyCardsContainer'),

  // Database Tab
  catalogTableBody: document.getElementById('catalogTableBody'),
  dbSearchInput: document.getElementById('dbSearchInput'),
  btnOpenNewCatalogModal: document.getElementById('btnOpenNewCatalogModal'),
  catalogModal: document.getElementById('catalogModal'),
  btnCloseCatalogModal: document.getElementById('btnCloseCatalogModal'),
  btnCancelCatalogModal: document.getElementById('btnCancelCatalogModal'),
  catalogForm: document.getElementById('catalogForm'),
  catName: document.getElementById('catName'),
  catCategory: document.getElementById('catCategory'),
  catUnit: document.getElementById('catUnit'),
  catLastPrice: document.getElementById('catLastPrice'),

  // Header Actions
  btnSoundToggle: document.getElementById('btnSoundToggle'),
  btnResetData: document.getElementById('btnResetData'),
  btnExportImport: document.getElementById('btnExportImport'),
  backupModal: document.getElementById('backupModal'),
  btnCloseBackupModal: document.getElementById('btnCloseBackupModal'),
  btnCloseBackupFooter: document.getElementById('btnCloseBackupFooter'),
  btnDownloadBackup: document.getElementById('btnDownloadBackup'),
  inputFileBackup: document.getElementById('inputFileBackup'),
  btnImportBackup: document.getElementById('btnImportBackup'),

  // Toast
  toast: document.getElementById('toastNotification'),
  toastIcon: document.getElementById('toastIcon'),
  toastMessage: document.getElementById('toastMessage')
};

// ===================================================================
// TOAST HELPER
// ===================================================================
function showToast(message, icon = 'ℹ️', duration = 3000) {
  els.toastIcon.textContent = icon;
  els.toastMessage.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    els.toast.classList.remove('show');
  }, duration);
}

// ===================================================================
// DATA PIPELINE & CALCULATIONS FOR CART
// ===================================================================
function processCartItem(rawItem) {
  const qty = Math.max(1, Number(rawItem.qty) || 1);
  const originalPrice = Math.max(0, Number(rawItem.price) || 0);

  // F-03: Kalkulator Diskon Bertingkat
  const discountCalc = calculateTieredDiscount(originalPrice, rawItem.discountStr);
  const finalPrice = discountCalc.finalPrice;
  const unitSavings = discountCalc.savings;

  // F-02: Perhitungan Kuantitas Otomatis
  const subtotal = finalPrice * qty;
  const totalItemSavings = unitSavings * qty;

  // F-04: Komparator Harga Realtime vs Bulan Lalu
  const comparison = comparePriceWithLastMonth(originalPrice, rawItem.lastMonthPrice);

  return {
    ...rawItem,
    qty,
    price: originalPrice,
    originalPrice,
    discountStr: rawItem.discountStr || '0',
    finalPrice,
    unitSavings,
    subtotal,
    totalItemSavings,
    discountCalc,
    comparison
  };
}

function calculateCartTotals(cartItems) {
  let totalSpent = 0;
  let totalSavings = 0;
  let totalCount = 0;

  const processed = cartItems.map(item => {
    const p = processCartItem(item);
    totalSpent += p.subtotal;
    totalSavings += p.totalItemSavings;
    totalCount += p.qty;
    return p;
  });

  return {
    items: processed,
    totalSpent,
    totalSavings,
    totalCount
  };
}

// ===================================================================
// RENDER: BUDGET SAFETY CAP DASHBOARD (F-05)
// ===================================================================
function renderSafetyCap(totalSpent, totalSavings) {
  const cap = state.budgetCap;
  const analysis = evaluateBudgetCap(totalSpent, cap);

  els.capTotalSpent.textContent = formatRupiah(totalSpent);
  els.capBudgetLimit.textContent = formatRupiah(cap);
  els.capSavingsSub.textContent = `Hemat: ${formatRupiah(totalSavings)}`;

  const remaining = cap - totalSpent;
  els.capRemaining.textContent = formatRupiah(remaining);

  if (remaining >= 0) {
    els.capRemaining.className = 'metric-value value-remaining positive';
    els.capRemainingSub.textContent = 'Sisa aman di dompet';
  } else {
    els.capRemaining.className = 'metric-value value-remaining negative';
    els.capRemainingSub.textContent = `Kurang ${formatRupiah(Math.abs(remaining))}!`;
  }

  const percentClamped = Math.min(100, Math.max(0, analysis.percent));
  els.capPercentText.textContent = `${Math.round(analysis.percent)}%`;
  els.capProgressBar.style.width = `${percentClamped}%`;

  // Progress Bar color & Card border
  els.safetyCapCard.classList.remove('budget-safe', 'budget-warning', 'budget-danger');
  els.capProgressBar.classList.remove('fill-safe', 'fill-warning', 'fill-danger');
  els.safetyCapBadge.classList.remove('badge-safe', 'badge-warning', 'badge-danger');
  els.capAdviceBanner.classList.remove('advice-safe', 'advice-warning', 'advice-danger');

  if (analysis.status === 'SAFE') {
    els.safetyCapCard.classList.add('budget-safe');
    els.capProgressBar.classList.add('fill-safe');
    els.safetyCapBadge.classList.add('badge-safe');
    els.capAdviceBanner.classList.add('advice-safe');
    els.safetyCapBadge.textContent = '● Anggaran Aman';
    els.capAdviceIcon.textContent = '✅';
  } else if (analysis.status === 'WARNING') {
    els.safetyCapCard.classList.add('budget-warning');
    els.capProgressBar.classList.add('fill-warning');
    els.safetyCapBadge.classList.add('badge-warning');
    els.capAdviceBanner.classList.add('advice-warning');
    els.safetyCapBadge.textContent = '● Waspada Limit';
    els.capAdviceIcon.textContent = '⚡';
  } else {
    // Critical or Overbudget
    els.safetyCapCard.classList.add('budget-danger');
    els.capProgressBar.classList.add('fill-danger');
    els.safetyCapBadge.classList.add('badge-danger');
    els.capAdviceBanner.classList.add('advice-danger');
    els.safetyCapBadge.textContent = analysis.status === 'OVERBUDGET' ? '⚠️ BAHAYA OVERBUDGET!' : '🚨 Kritis Mendekati Batas';
    els.capAdviceIcon.textContent = '⛔';

    if (analysis.status === 'OVERBUDGET') {
      sfx.playDanger();
    }
  }

  els.capAdviceText.textContent = analysis.advice;
}

// ===================================================================
// RENDER: CART LIST & QUICK CHIPS
// ===================================================================
function renderCart() {
  const { items, totalSpent, totalSavings, totalCount } = calculateCartTotals(state.cart);

  // Update Mini Header Counts & Tab Badges
  els.tabCartBadge.textContent = items.length;
  els.cartHeaderCount.textContent = `(${items.length} jenis, total ${totalCount} barang)`;
  els.cartItemsMiniCount.textContent = `${items.length} jenis item`;

  // Update Safety Cap
  renderSafetyCap(totalSpent, totalSavings);

  if (items.length === 0) {
    els.cartItemsContainer.innerHTML = '';
    els.emptyCartState.style.display = 'block';
    els.cartCheckoutBar.style.display = 'none';
    return;
  }

  els.emptyCartState.style.display = 'none';
  els.cartCheckoutBar.style.display = 'block';

  let html = '';
  items.forEach(item => {
    const comp = item.comparison;
    const disc = item.discountCalc;

    // F-04 Badge Text & Class
    const fluctuationHtml = `
      <span class="fluctuation-badge ${comp.colorClass}" title="${comp.advice}">
        <span>${comp.symbol}</span>
        <span>${comp.badgeText}</span>
      </span>
    `;

    // F-03 Discount Pill
    let discountHtml = '';
    if (disc.savings > 0) {
      discountHtml = `
        <span class="item-discount-pill" title="${disc.description}">
          🏷️ ${item.discountStr} (-${formatRupiah(item.unitSavings)})
        </span>
        <span class="item-strikethrough">${formatRupiah(item.originalPrice)}</span>
      `;
    }

    // Historical comparison note
    let historyNote = '';
    if (item.lastMonthPrice) {
      historyNote = `<span class="item-history-note">Bulan lalu: ${formatRupiah(item.lastMonthPrice)}/${item.unit}</span>`;
    }

    html += `
      <div class="cart-item-card" data-id="${item.id}">
        
        <!-- Left: Product Details & Fluctuation -->
        <div class="item-main-info">
          <div class="item-top-row">
            <span class="item-title">${item.name}</span>
            <span class="item-category-tag">${item.category}</span>
            ${fluctuationHtml}
          </div>

          <div class="item-pricing-row">
            <span class="item-unit-price">${formatRupiah(item.finalPrice)}/${item.unit}</span>
            ${discountHtml}
          </div>

          ${historyNote}
        </div>

        <!-- Right: Realtime Quantity Stepper (F-02) & Subtotal -->
        <div class="item-controls-col">
          <div class="item-subtotal">${formatRupiah(item.subtotal)}</div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="stepper-group">
              <button class="stepper-btn btn-qty-minus" data-id="${item.id}" aria-label="Kurang Qty">−</button>
              <input type="number" class="stepper-input input-qty" data-id="${item.id}" value="${item.qty}" min="1" max="999">
              <button class="stepper-btn btn-qty-plus" data-id="${item.id}" aria-label="Tambah Qty">+</button>
            </div>

            <div class="item-actions-row">
              <button class="action-icon-btn btn-edit-item" data-id="${item.id}" title="Edit Detail">✏️</button>
              <button class="action-icon-btn btn-delete-item" data-id="${item.id}" title="Hapus dari Troli">🗑️</button>
            </div>
          </div>
        </div>

      </div>
    `;
  });

  els.cartItemsContainer.innerHTML = html;

  // Attach interactive listeners for Qty Stepper (F-02)
  attachCartEventListeners();
}

function attachCartEventListeners() {
  // Plus Buttons
  document.querySelectorAll('.btn-qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      changeItemQty(id, 1);
    });
  });

  // Minus Buttons
  document.querySelectorAll('.btn-qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      changeItemQty(id, -1);
    });
  });

  // Direct Number Input on Qty (F-02 Realtime change)
  document.querySelectorAll('.input-qty').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.currentTarget.dataset.id;
      const newQty = Math.max(1, parseInt(e.currentTarget.value) || 1);
      setItemQty(id, newQty);
    });
  });

  // Edit Buttons
  document.querySelectorAll('.btn-edit-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openEditItemModal(id);
    });
  });

  // Delete Buttons
  document.querySelectorAll('.btn-delete-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      deleteCartItem(id);
    });
  });
}

function changeItemQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  const newQty = (item.qty || 1) + delta;
  if (newQty < 1) {
    if (confirm(`Hapus "${item.name}" dari troli belanja?`)) {
      deleteCartItem(id);
    }
    return;
  }

  item.qty = newQty;
  saveCart(state.cart);
  sfx.playBeep(delta > 0 ? 640 : 480, 'sine', 0.05);
  renderCart();
}

function setItemQty(id, newQty) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  item.qty = Math.max(1, newQty);
  saveCart(state.cart);
  sfx.playBeep(600, 'sine', 0.05);
  renderCart();
}

function deleteCartItem(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart(state.cart);
  sfx.playBeep(350, 'sawtooth', 0.08);
  showToast('Item berhasil dihapus dari keranjang', '🗑️');
  renderCart();
}

// Quick Staple Chips
function renderStapleChips() {
  const catalog = state.catalog;
  let html = '';

  catalog.slice(0, 8).forEach(catItem => {
    html += `
      <button class="staple-chip" data-id="${catItem.id}">
        <span>➕ ${catItem.name}</span>
        <span style="font-size: 0.7rem; color: var(--text-dim);">${formatRupiah(catItem.lastMonthPrice)}</span>
      </button>
    `;
  });

  els.stapleChipsContainer.innerHTML = html;

  els.stapleChipsContainer.querySelectorAll('.staple-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.id;
      const catItem = state.catalog.find(c => c.id === id);
      if (!catItem) return;

      // Check if item already exists in cart
      const existing = state.cart.find(i => i.name.toLowerCase() === catItem.name.toLowerCase());
      if (existing) {
        existing.qty += (catItem.defaultQty || 1);
        showToast(`Kuantitas ${existing.name} ditambah!`, '➕');
      } else {
        state.cart.push({
          id: `cart-${Date.now()}`,
          name: catItem.name,
          category: catItem.category,
          unit: catItem.unit,
          qty: catItem.defaultQty || 1,
          price: catItem.lastMonthPrice, // Default to historical price
          discountStr: '0',
          lastMonthPrice: catItem.lastMonthPrice,
          notes: catItem.notes
        });
        showToast(`${catItem.name} dimasukkan ke keranjang`, '🛒');
      }

      saveCart(state.cart);
      sfx.playSuccess();
      renderCart();
    });
  });
}

// ===================================================================
// MODAL: TAMBAH & EDIT ITEM BELANJA (F-01)
// ===================================================================
function openAddItemModal() {
  state.editingItemId = null;
  els.itemModalTitle.textContent = '➕ Tambah Barang ke Troli';
  els.formItemId.value = '';
  els.itemForm.reset();
  els.formItemQty.value = '1';
  els.formItemDiscount.value = '0';
  els.formPreviewBanner.style.display = 'none';

  els.itemModal.classList.add('active');
  setTimeout(() => els.formItemName.focus(), 100);
}

function openEditItemModal(id) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;

  state.editingItemId = id;
  els.itemModalTitle.textContent = '✏️ Edit Barang di Troli';
  els.formItemId.value = item.id;
  els.formItemName.value = item.name;
  els.formItemCategory.value = item.category;
  els.formItemUnit.value = item.unit;
  els.formItemQty.value = item.qty;
  els.formItemPrice.value = item.price;
  els.formItemDiscount.value = item.discountStr || '0';
  els.formItemLastPrice.value = item.lastMonthPrice || '';

  updateModalLivePreview();
  els.itemModal.classList.add('active');
}

function closeItemModal() {
  els.itemModal.classList.remove('active');
  state.editingItemId = null;
}

// Auto-fill historical price when typing product name
function handleNameAutofill() {
  const nameInput = els.formItemName.value.trim().toLowerCase();
  if (nameInput.length < 2) return;

  const match = state.catalog.find(c => c.name.toLowerCase().includes(nameInput));
  if (match) {
    if (!els.formItemLastPrice.value) {
      els.formItemLastPrice.value = match.lastMonthPrice;
    }
    if (!els.formItemCategory.value) {
      els.formItemCategory.value = match.category;
    }
    if (!els.formItemUnit.value) {
      els.formItemUnit.value = match.unit;
    }
    updateModalLivePreview();
  }
}

function updateModalLivePreview() {
  const price = Number(els.formItemPrice.value) || 0;
  const qty = Number(els.formItemQty.value) || 1;
  const discountStr = els.formItemDiscount.value || '0';
  const lastPrice = Number(els.formItemLastPrice.value) || 0;

  if (price <= 0) {
    els.formPreviewBanner.style.display = 'none';
    return;
  }

  const disc = calculateTieredDiscount(price, discountStr);
  const subtotal = disc.finalPrice * qty;
  const comp = comparePriceWithLastMonth(price, lastPrice);

  els.formPreviewBanner.style.display = 'flex';
  els.formPreviewBanner.className = `cap-advice-banner ${comp.colorClass === 'price-up' ? 'advice-danger' : comp.colorClass === 'price-down' ? 'advice-safe' : 'advice-warning'}`;
  els.formPreviewBanner.innerHTML = `
    <span>${comp.symbol}</span>
    <div>
      <strong>Subtotal: ${formatRupiah(subtotal)}</strong> (${formatRupiah(disc.finalPrice)}/${els.formItemUnit.value})
      <br><small>${comp.badgeText} - ${disc.description}</small>
    </div>
  `;
}

function saveItemFromModal(e) {
  e.preventDefault();

  const name = els.formItemName.value.trim();
  const category = els.formItemCategory.value;
  const unit = els.formItemUnit.value;
  const qty = Math.max(1, parseInt(els.formItemQty.value) || 1);
  const price = Math.max(0, parseFloat(els.formItemPrice.value) || 0);
  const discountStr = els.formItemDiscount.value.trim() || '0';
  const lastMonthPrice = els.formItemLastPrice.value ? parseFloat(els.formItemLastPrice.value) : null;

  if (!name || price <= 0) {
    showToast('Nama produk dan harga wajib diisi!', '⚠️');
    return;
  }

  if (state.editingItemId) {
    // Edit existing
    const item = state.cart.find(i => i.id === state.editingItemId);
    if (item) {
      item.name = name;
      item.category = category;
      item.unit = unit;
      item.qty = qty;
      item.price = price;
      item.discountStr = discountStr;
      item.lastMonthPrice = lastMonthPrice;
      showToast(`Item "${name}" berhasil diperbarui`, '✅');
    }
  } else {
    // Add new
    state.cart.push({
      id: `cart-${Date.now()}`,
      name,
      category,
      unit,
      qty,
      price,
      discountStr,
      lastMonthPrice
    });
    showToast(`"${name}" dimasukkan ke troli`, '🛒');
  }

  saveCart(state.cart);
  sfx.playSuccess();
  closeItemModal();
  renderCart();
}

// ===================================================================
// BUDGET SAFETY CAP MODAL
// ===================================================================
function openBudgetModal() {
  els.inputNewBudget.value = state.budgetCap;
  els.budgetModal.classList.add('active');
  setTimeout(() => els.inputNewBudget.focus(), 100);
}

function closeBudgetModal() {
  els.budgetModal.classList.remove('active');
}

function saveNewBudget() {
  const newBudget = Math.max(1000, Number(els.inputNewBudget.value) || 0);
  state.budgetCap = newBudget;
  setBudgetCap(newBudget);
  sfx.playSuccess();
  closeBudgetModal();
  showToast(`Batas uang saku diatur ke ${formatRupiah(newBudget)}`, '💰');
  renderCart();
}

// ===================================================================
// TAB 2: KALKULATOR DISKON BERTINGKAT & PROMO DUEL (F-03)
// ===================================================================
function updateTieredDiscountCalculator() {
  const basePrice = Number(els.calcBasePrice.value) || 0;
  const discountStr = els.calcDiscountInput.value.trim();

  const res = calculateTieredDiscount(basePrice, discountStr);

  els.calcFinalPriceDisplay.textContent = formatRupiah(res.finalPrice);
  els.calcSavingsBadge.textContent = `Hemat ${formatRupiah(res.savings)} (Diskon Efektif: ${res.effectivePercentage}%)`;

  let breakdownHtml = `
    <div class="step-row">
      <span class="step-label">Harga Awal:</span>
      <span class="step-val">${formatRupiah(res.originalPrice)}</span>
    </div>
  `;

  if (res.steps.length > 0) {
    res.steps.forEach(step => {
      breakdownHtml += `
        <div class="step-row">
          <span class="step-label">${step.label}</span>
          <span class="step-val" style="color: #fbbf24;">${formatRupiah(step.priceAfter)}</span>
        </div>
      `;
    });
  }

  breakdownHtml += `
    <div class="step-row" style="font-weight: 800; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 4px; padding-top: 6px;">
      <span class="step-label" style="color: #ffffff;">Keterangan:</span>
      <span class="step-val" style="color: #34d399;">${res.description}</span>
    </div>
  `;

  els.calcBreakdownBox.innerHTML = breakdownHtml;
}

window.applyCalcPreset = function(presetText) {
  els.calcDiscountInput.value = presetText;
  updateTieredDiscountCalculator();
  sfx.playBeep(600, 'sine', 0.05);
};

function transferCalcResultToCart() {
  const basePrice = Number(els.calcBasePrice.value) || 0;
  const discountStr = els.calcDiscountInput.value.trim();

  openAddItemModal();
  els.formItemPrice.value = basePrice;
  els.formItemDiscount.value = discountStr;
  updateModalLivePreview();
  showToast('Hasil diskon disalin ke formulir barang!', '📋');
}

// Unit Price Battle (Dilema Minyak 1L vs 5L)
function updateUnitPriceBattle() {
  const optA = {
    name: els.optAName.value.trim() || 'Opsi A',
    price: Number(els.optAPrice.value) || 0,
    volume: Number(els.optAVolume.value) || 1,
    unit: els.optAUnit.value.trim() || 'unit'
  };

  const optB = {
    name: els.optBName.value.trim() || 'Opsi B',
    price: Number(els.optBPrice.value) || 0,
    volume: Number(els.optBVolume.value) || 1,
    unit: els.optBUnit.value.trim() || 'unit'
  };

  const battle = compareUnitPrices(optA, optB);

  els.optARate.textContent = battle.optionA.formattedUnitPrice;
  els.optBRate.textContent = battle.optionB.formattedUnitPrice;

  els.boxOptionA.classList.remove('winner');
  els.boxOptionB.classList.remove('winner');

  // Clear existing badges
  const badgeA = els.boxOptionA.querySelector('.winner-badge');
  if (badgeA) badgeA.remove();
  const badgeB = els.boxOptionB.querySelector('.winner-badge');
  if (badgeB) badgeB.remove();

  if (battle.winner === 'A') {
    els.boxOptionA.classList.add('winner');
    els.boxOptionA.insertAdjacentHTML('afterbegin', '<span class="winner-badge">🏆 LEBIH HEMAT</span>');
  } else if (battle.winner === 'B') {
    els.boxOptionB.classList.add('winner');
    els.boxOptionB.insertAdjacentHTML('afterbegin', '<span class="winner-badge">🏆 LEBIH HEMAT</span>');
  }

  els.unitBattleSummary.innerHTML = `<strong>${battle.summary}</strong>`;
}

// ===================================================================
// TAB 3: STRUK & RIWAYAT BELANJA (F-06 ANTI-PUDAR)
// ===================================================================
function renderHistory() {
  const history = state.history;

  if (history.length === 0) {
    els.historyCardsContainer.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-icon">📜</div>
        <h3>Belum Ada Struk Tersimpan</h3>
        <p>Setelah belanja selesai di supermarket, klik tombol "Selesai Belanja & Arsipkan Struk" untuk menyimpan struk digital permanen.</p>
      </div>
    `;
    return;
  }

  let html = '';
  history.forEach(trip => {
    html += `
      <div class="history-card" data-id="${trip.id}">
        <div>
          <div class="history-meta-title">${trip.title || trip.monthName || 'Belanja Bulanan'}</div>
          <div class="history-meta-sub">
            📅 ${trip.date} • 📦 ${trip.itemsCount || trip.items?.length || 0} item belanjaan
          </div>
          <div class="history-status-tag">✓ Data tersimpan aman (Anti-Pudar)</div>
        </div>

        <div>
          <div class="history-total-val">${formatRupiah(trip.totalSpent)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); text-align: right;">
            Batas: ${formatRupiah(trip.budgetCap)}
          </div>
        </div>
      </div>
    `;
  });

  els.historyCardsContainer.innerHTML = html;

  // Click card to view thermal receipt
  els.historyCardsContainer.querySelectorAll('.history-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const trip = state.history.find(t => t.id === id);
      if (trip) openReceiptModal(trip);
    });
  });
}

function openReceiptModal(trip) {
  els.recNo.textContent = trip.receiptNo || `STRUK-${trip.id}`;
  els.recDate.textContent = trip.date;
  els.recTime.textContent = trip.time || '10:00 WIB';

  let tableHtml = '';
  trip.items.forEach(item => {
    tableHtml += `
      <tr>
        <td>
          <strong>${item.name}</strong><br>
          <small style="color: #64748b;">${item.qty} ${item.unit} x ${formatRupiah(item.finalPrice || item.price)}</small>
        </td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">${formatRupiah(item.subtotal)}</td>
      </tr>
    `;
  });

  els.recTableBody.innerHTML = tableHtml;
  els.recGrandTotal.textContent = formatRupiah(trip.totalSpent);
  els.recTotalSavings.textContent = formatRupiah(trip.totalSavings || 0);
  els.recBudgetCap.textContent = formatRupiah(trip.budgetCap);

  const change = (trip.budgetCap || 0) - trip.totalSpent;
  els.recChangeMoney.textContent = formatRupiah(change);

  els.receiptModal.classList.add('active');
  sfx.playSuccess();
}

function closeReceiptModal() {
  els.receiptModal.classList.remove('active');
}

// Finish Shopping Trip (F-06)
function finishCurrentShoppingTrip() {
  const { items, totalSpent } = calculateCartTotals(state.cart);

  if (items.length === 0) {
    showToast('Keranjang masih kosong!', '⚠️');
    return;
  }

  // Safety confirmation
  const remaining = state.budgetCap - totalSpent;
  if (remaining < 0) {
    const proceed = confirm(`⚠️ PERINGATAN KASIR: Total belanjaan (${formatRupiah(totalSpent)}) melebihi uang saku dompet (${formatRupiah(state.budgetCap)}) sebesar ${formatRupiah(Math.abs(remaining))}!\n\nApakah yakin ingin tetap menyimpan struk ini?`);
    if (!proceed) return;
  } else {
    const ok = confirm(`Selesaikan belanja dengan total ${formatRupiah(totalSpent)}?\n\nStruk digital akan disimpan permanen, dan harga hari ini akan menjadi data acuan bulan depan.`);
    if (!ok) return;
  }

  // Archive
  const receipt = archiveCurrentShoppingTrip(items, state.budgetCap);
  state.history = getHistory();
  state.catalog = getCatalog();
  state.cart = [];

  showToast('Belanja selesai! Struk digital berhasil diarsipkan.', '🧾');
  renderCart();
  renderHistory();
  renderCatalogTable();
  openReceiptModal(receipt);
}

// ===================================================================
// TAB 4: DATABASE HARGA MASTER (F-04 / F-06)
// ===================================================================
function renderCatalogTable(filterQuery = '') {
  let list = state.catalog;
  if (filterQuery) {
    const q = filterQuery.toLowerCase().trim();
    list = list.filter(item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
  }

  if (list.length === 0) {
    els.catalogTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-dim); padding: 24px;">
          Tidak ada barang yang cocok dengan pencarian.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  list.forEach(item => {
    html += `
      <tr>
        <td>
          <strong>${item.name}</strong><br>
          <small style="color: var(--text-dim);">${item.notes || ''}</small>
        </td>
        <td><span class="item-category-tag">${item.category}</span></td>
        <td>${item.unit}</td>
        <td><strong style="color: #ffffff;">${formatRupiah(item.lastMonthPrice)}</strong></td>
        <td>
          <button class="btn btn-outline btn-add-cat-to-cart" data-id="${item.id}" style="padding: 4px 10px; font-size: 0.75rem;">
            🛒 Beli
          </button>
        </td>
      </tr>
    `;
  });

  els.catalogTableBody.innerHTML = html;

  els.catalogTableBody.querySelectorAll('.btn-add-cat-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const catItem = state.catalog.find(c => c.id === id);
      if (!catItem) return;

      state.cart.push({
        id: `cart-${Date.now()}`,
        name: catItem.name,
        category: catItem.category,
        unit: catItem.unit,
        qty: catItem.defaultQty || 1,
        price: catItem.lastMonthPrice,
        discountStr: '0',
        lastMonthPrice: catItem.lastMonthPrice,
        notes: catItem.notes
      });

      saveCart(state.cart);
      sfx.playSuccess();
      showToast(`${catItem.name} dimasukkan ke keranjang`, '🛒');
      renderCart();
      switchTab('tab-cart');
    });
  });
}

function openNewCatalogModal() {
  els.catalogForm.reset();
  els.catalogModal.classList.add('active');
  setTimeout(() => els.catName.focus(), 100);
}

function closeCatalogModal() {
  els.catalogModal.classList.remove('active');
}

function saveNewCatalogItem(e) {
  e.preventDefault();
  const name = els.catName.value.trim();
  const category = els.catCategory.value;
  const unit = els.catUnit.value;
  const price = Math.max(0, parseFloat(els.catLastPrice.value) || 0);

  if (!name || price <= 0) {
    showToast('Nama dan harga wajib diisi!', '⚠️');
    return;
  }

  state.catalog.push({
    id: `item-${Date.now()}`,
    name,
    category,
    unit,
    defaultQty: 1,
    lastMonthPrice: price,
    notes: 'Ditambahkan manual'
  });

  saveCatalog(state.catalog);
  sfx.playSuccess();
  closeCatalogModal();
  renderCatalogTable();
  renderStapleChips();
  showToast(`"${name}" ditambahkan ke database master`, '📈');
}

// ===================================================================
// TAB NAVIGATION
// ===================================================================
function switchTab(targetTabId) {
  state.activeTab = targetTabId;

  els.navBtns.forEach(btn => {
    const isTarget = btn.dataset.tab === targetTabId;
    btn.classList.toggle('active', isTarget);
  });

  els.tabContents.forEach(content => {
    const isTarget = content.id === targetTabId;
    content.classList.toggle('active', isTarget);
  });

  sfx.playBeep(500, 'sine', 0.04);

  // Lazy render
  if (targetTabId === 'tab-receipts') {
    renderHistory();
  } else if (targetTabId === 'tab-database') {
    renderCatalogTable();
  }
}

// ===================================================================
// EMERGENCY: SORT BY HIGHEST PRICE
// ===================================================================
function sortCartByPrice() {
  state.cart.sort((a, b) => {
    const subA = (a.price || 0) * (a.qty || 1);
    const subB = (b.price || 0) * (b.qty || 1);
    return subB - subA; // Descending
  });
  saveCart(state.cart);
  sfx.playSuccess();
  renderCart();
  showToast('Keranjang diurutkan dari barang termahal!', '↕️');
}

// ===================================================================
// BACKUP & RESTORE JSON
// ===================================================================
function downloadBackupFile() {
  const jsonStr = exportDatabaseJSON();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rian-the-sloth-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('File cadangan berhasil diunduh', '📥');
}

function handleImportBackupFile() {
  const file = els.inputFileBackup.files[0];
  if (!file) {
    showToast('Pilih file JSON terlebih dahulu!', '⚠️');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const res = importDatabaseJSON(content);
    if (res.success) {
      loadStateFromStorage();
      renderAll();
      els.backupModal.classList.remove('active');
      showToast('Data berhasil dipulihkan!', '✅');
      sfx.playSuccess();
    } else {
      showToast(`Gagal mengimpor: ${res.error}`, '❌');
    }
  };
  reader.readAsText(file);
}

// ===================================================================
// INITIALIZATION
// ===================================================================
function loadStateFromStorage() {
  initStorage();
  state.budgetCap = getBudgetCap();
  state.cart = getCart();
  state.catalog = getCatalog();
  state.history = getHistory();
}

function renderAll() {
  renderStapleChips();
  renderCart();
  renderHistory();
  renderCatalogTable();
  updateTieredDiscountCalculator();
  updateUnitPriceBattle();
}

function setupEventListeners() {
  // Tabs
  els.navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Cart actions
  els.btnOpenAddModal.addEventListener('click', openAddItemModal);
  els.btnEmptyAdd.addEventListener('click', openAddItemModal);
  els.btnCloseItemModal.addEventListener('click', closeItemModal);
  els.btnCancelItemModal.addEventListener('click', closeItemModal);
  els.itemForm.addEventListener('submit', saveItemFromModal);

  // Live calculation preview in Add Item Modal
  els.formItemName.addEventListener('input', handleNameAutofill);
  els.formItemPrice.addEventListener('input', updateModalLivePreview);
  els.formItemQty.addEventListener('input', updateModalLivePreview);
  els.formItemDiscount.addEventListener('input', updateModalLivePreview);
  els.formItemLastPrice.addEventListener('input', updateModalLivePreview);

  // Budget Safety Cap
  els.btnEditBudget.addEventListener('click', openBudgetModal);
  els.btnCloseBudgetModal.addEventListener('click', closeBudgetModal);
  els.btnCancelBudgetModal.addEventListener('click', closeBudgetModal);
  els.btnSaveBudgetModal.addEventListener('click', saveNewBudget);

  // Clear cart & Sort
  els.btnClearCart.addEventListener('click', () => {
    if (confirm('Kosongkan semua barang dari troli belanja?')) {
      state.cart = [];
      saveCart([]);
      renderCart();
      showToast('Keranjang belanja dikosongkan', '🗑️');
    }
  });
  els.btnSortByPrice.addEventListener('click', sortCartByPrice);

  // Finish shopping
  els.btnFinishTrip.addEventListener('click', finishCurrentShoppingTrip);

  // Receipt Modal
  els.btnCloseReceiptModal.addEventListener('click', closeReceiptModal);
  els.btnDoneReceipt.addEventListener('click', closeReceiptModal);
  els.btnPrintReceipt.addEventListener('click', () => {
    window.print();
  });

  // Calc tab events
  els.calcBasePrice.addEventListener('input', updateTieredDiscountCalculator);
  els.calcDiscountInput.addEventListener('input', updateTieredDiscountCalculator);
  els.btnTransferToCart.addEventListener('click', transferCalcResultToCart);

  // Unit battle inputs
  [
    els.optAName, els.optAPrice, els.optAVolume, els.optAUnit,
    els.optBName, els.optBPrice, els.optBVolume, els.optBUnit
  ].forEach(input => {
    input.addEventListener('input', updateUnitPriceBattle);
  });

  // Database Tab
  els.dbSearchInput.addEventListener('input', (e) => renderCatalogTable(e.target.value));
  els.btnOpenNewCatalogModal.addEventListener('click', openNewCatalogModal);
  els.btnCloseCatalogModal.addEventListener('click', closeCatalogModal);
  els.btnCancelCatalogModal.addEventListener('click', closeCatalogModal);
  els.catalogForm.addEventListener('submit', saveNewCatalogItem);

  // Header Actions
  els.btnSoundToggle.addEventListener('click', () => {
    const isNowOn = sfx.toggle();
    els.btnSoundToggle.textContent = isNowOn ? '🔔' : '🔕';
    showToast(isNowOn ? 'Suara efek aktif' : 'Suara efek dimatikan', isNowOn ? '🔔' : '🔕');
  });

  els.btnResetData.addEventListener('click', () => {
    if (confirm('Reset seluruh data aplikasi ke cerita awal Rian (Beras, Telur, Minyak, Sabun, Budget Rp 300.000)?')) {
      resetDataToDefaults();
      loadStateFromStorage();
      renderAll();
      showToast('Data berhasil di-reset ke default cerita Rian', '🔄');
      sfx.playSuccess();
    }
  });

  els.btnExportImport.addEventListener('click', () => {
    els.backupModal.classList.add('active');
  });
  els.btnCloseBackupModal.addEventListener('click', () => els.backupModal.classList.remove('active'));
  els.btnCloseBackupFooter.addEventListener('click', () => els.backupModal.classList.remove('active'));
  els.btnDownloadBackup.addEventListener('click', downloadBackupFile);
  els.btnImportBackup.addEventListener('click', handleImportBackupFile);
}

// Start
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  setupEventListeners();
  renderAll();
});

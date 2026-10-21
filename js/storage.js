import { DEFAULT_HISTORY_CATALOG, DEFAULT_SHOPPING_HISTORY } from './data.js';

const STORAGE_KEYS = {
  CATALOG: 'rian_groceries_catalog_v1',
  CART: 'rian_groceries_cart_v1',
  HISTORY: 'rian_groceries_history_v1',
  BUDGET: 'rian_groceries_budget_v1',
  SETTINGS: 'rian_groceries_settings_v1'
};

/**
 * Inisialisasi data default ke LocalStorage jika belum ada
 */
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.CATALOG)) {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(DEFAULT_HISTORY_CATALOG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(DEFAULT_SHOPPING_HISTORY));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGET)) {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(300000)); // Default budget kos Rian Rp 300.000
  }
  if (!localStorage.getItem(STORAGE_KEYS.CART)) {
    // Berikan beberapa item awal di keranjang untuk demo langsung
    const initialCart = [
      {
        id: "cart-1",
        name: "Beras Ramos Super",
        category: "Makanan Pokok",
        unit: "kg",
        qty: 5,
        price: 74000, // Naik dari 68.000
        discountStr: "0",
        lastMonthPrice: 68000,
        notes: "Naik Rp 6.000 vs bulan lalu"
      },
      {
        id: "cart-2",
        name: "Telur Ayam Negeri",
        category: "Makanan Pokok",
        unit: "kg",
        qty: 1,
        price: 32000, // Naik dari 28.000
        discountStr: "0",
        lastMonthPrice: 28000,
        notes: "Harga telur lagi tinggi"
      },
      {
        id: "cart-3",
        name: "Minyak Goreng Refill",
        category: "Bumbu & Minyak",
        unit: "liter",
        qty: 2,
        price: 34000, // Turun dari 36.000
        discountStr: "0",
        lastMonthPrice: 36000,
        notes: "Lagi promo turun harga"
      },
      {
        id: "cart-4",
        name: "Pembersih Lantai Karbol",
        category: "Perlengkapan Mandi & Cuci",
        unit: "pcs",
        qty: 1,
        price: 25000,
        discountStr: "50% + 20%", // Promo bertingkat di narasi Rian!
        lastMonthPrice: 18500,
        notes: "Promo Cuci Gudang 50% + 20%"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(initialCart));
  }
}

export function getBudgetCap() {
  const val = localStorage.getItem(STORAGE_KEYS.BUDGET);
  return val ? Number(val) : 300000;
}

export function setBudgetCap(amount) {
  localStorage.setItem(STORAGE_KEYS.BUDGET, String(Number(amount) || 0));
}

export function getCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    return raw ? JSON.parse(raw) : DEFAULT_HISTORY_CATALOG;
  } catch (e) {
    return DEFAULT_HISTORY_CATALOG;
  }
}

export function saveCatalog(catalog) {
  localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
}

export function getCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : DEFAULT_SHOPPING_HISTORY;
  } catch (e) {
    return DEFAULT_SHOPPING_HISTORY;
  }
}

export function saveHistory(history) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

/**
 * Menyelesaikan belanja saat ini:
 * 1. Simpan struk belanja ke Riwayat Belanja (F-06).
 * 2. Perbarui harga riwayat bulan lalu di Katalog dengan harga belanjaan hari ini.
 * 3. Kosongkan keranjang untuk sesi berikutnya.
 */
export function archiveCurrentShoppingTrip(cartItems, budgetCap, tripName = null) {
  const now = new Date();
  const dateFormatted = now.toISOString().split('T')[0];
  const timeFormatted = now.toTimeString().split(' ')[0].substring(0, 5);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const autoTitle = tripName || `Belanja Bulanan Kos - ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  let totalSpent = 0;
  let totalSavings = 0;

  const receiptItems = cartItems.map(item => {
    totalSpent += item.subtotal;
    totalSavings += (item.originalPrice * item.qty) - item.subtotal;
    return {
      name: item.name,
      category: item.category,
      unit: item.unit,
      qty: item.qty,
      price: item.price,
      discountStr: item.discountStr,
      finalPrice: item.finalPrice,
      subtotal: item.subtotal,
      lastMonthPrice: item.lastMonthPrice
    };
  });

  const receipt = {
    id: `receipt-${Date.now()}`,
    receiptNo: `STRUK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: autoTitle,
    date: dateFormatted,
    time: timeFormatted,
    budgetCap,
    totalSpent,
    totalSavings,
    remainingBudget: budgetCap - totalSpent,
    itemsCount: receiptItems.length,
    items: receiptItems
  };

  // Simpan ke riwayat
  const history = getHistory();
  history.unshift(receipt);
  saveHistory(history);

  // Perbarui harga riwayat bulan lalu di katalog
  const catalog = getCatalog();
  receiptItems.forEach(recItem => {
    const existing = catalog.find(c => c.name.toLowerCase().trim() === recItem.name.toLowerCase().trim());
    if (existing) {
      existing.lastMonthPrice = recItem.finalPrice; // Update ke harga terbaru
    } else {
      catalog.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: recItem.name,
        category: recItem.category,
        unit: recItem.unit,
        defaultQty: recItem.qty,
        lastMonthPrice: recItem.finalPrice,
        unitPerPackage: 1,
        notes: "Ditambahkan otomatis dari riwayat belanja"
      });
    }
  });
  saveCatalog(catalog);

  // Kosongkan keranjang
  saveCart([]);

  return receipt;
}

/**
 * Reset data ke pengaturan awal cerita Rian
 */
export function resetDataToDefaults() {
  localStorage.removeItem(STORAGE_KEYS.CATALOG);
  localStorage.removeItem(STORAGE_KEYS.CART);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  localStorage.removeItem(STORAGE_KEYS.BUDGET);
  initStorage();
}

/**
 * Ekspor data aplikasi ke JSON
 */
export function exportDatabaseJSON() {
  const data = {
    app: "RianTheSloth - Asisten Belanja Pintar Anak Kos",
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    budgetCap: getBudgetCap(),
    cart: getCart(),
    history: getHistory(),
    catalog: getCatalog()
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Impor data aplikasi dari JSON
 */
export function importDatabaseJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (data.catalog && Array.isArray(data.catalog)) {
      saveCatalog(data.catalog);
    }
    if (data.history && Array.isArray(data.history)) {
      saveHistory(data.history);
    }
    if (data.cart && Array.isArray(data.cart)) {
      saveCart(data.cart);
    }
    if (data.budgetCap) {
      setBudgetCap(data.budgetCap);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

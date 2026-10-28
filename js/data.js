// Data awal riwayat belanja dan master katalog untuk Rian
export const DEFAULT_HISTORY_CATALOG = [
  {
    id: "item-beras-5kg",
    name: "Beras Ramos Super",
    category: "Makanan Pokok",
    unit: "kg",
    defaultQty: 5,
    lastMonthPrice: 68000, // Rp 68.000 per 5kg (atau Rp 13.600/kg)
    unitPerPackage: 5,
    notes: "Kebutuhan pokok 1 bulan"
  },
  {
    id: "item-telur-1kg",
    name: "Telur Ayam Negeri",
    category: "Makanan Pokok",
    unit: "kg",
    defaultQty: 1,
    lastMonthPrice: 28000,
    unitPerPackage: 1,
    notes: "Sumber protein harian kos"
  },
  {
    id: "item-minyak-2l",
    name: "Minyak Goreng Refill",
    category: "Bumbu & Minyak",
    unit: "liter",
    defaultQty: 2,
    lastMonthPrice: 36000, // Rp 18.000/L
    unitPerPackage: 2,
    notes: "Untuk masak bekal harian"
  },
  {
    id: "item-sabun-lantai",
    name: "Pembersih Lantai Karbol",
    category: "Perlengkapan Mandi & Cuci",
    unit: "pcs",
    defaultQty: 1,
    lastMonthPrice: 18500,
    unitPerPackage: 1,
    notes: "Kamar kos 3x3 tetap wangi dan higienis"
  },
  {
    id: "item-sabun-cuci-baju",
    name: "Deterjen Bubuk Cuci Baju",
    category: "Perlengkapan Mandi & Cuci",
    unit: "pack",
    defaultQty: 1,
    lastMonthPrice: 22000,
    unitPerPackage: 1,
    notes: "800 gram buat cuci baju sendiri"
  },
  {
    id: "item-sabun-mandi",
    name: "Sabun Mandi Batang (Isi 4)",
    category: "Perlengkapan Mandi & Cuci",
    unit: "pack",
    defaultQty: 1,
    lastMonthPrice: 14000,
    unitPerPackage: 4,
    notes: "Paket hemat isi 4 sabun"
  },
  {
    id: "item-pasta-gigi",
    name: "Pasta Gigi Herbal 190g",
    category: "Perlengkapan Mandi & Cuci",
    unit: "pcs",
    defaultQty: 1,
    lastMonthPrice: 16500,
    unitPerPackage: 1,
    notes: "Ukuran jumbo untuk 2 bulan"
  },
  {
    id: "item-mie-instan",
    name: "Mie Instan Goreng (Isi 10)",
    category: "Makanan Instan",
    unit: "pack",
    defaultQty: 1,
    lastMonthPrice: 30000,
    unitPerPackage: 10,
    notes: "Penyelamat akhir bulan"
  },
  {
    id: "item-sarden",
    name: "Ikan Sarden Saus Tomat 425g",
    category: "Makanan Instan",
    unit: "kaleng",
    defaultQty: 2,
    lastMonthPrice: 24000,
    unitPerPackage: 1,
    notes: "Makanan praktis cepat saji"
  },
  {
    id: "item-sabun-cuci-piring",
    name: "Sabun Cuci Piring Jeruk Nipis 700ml",
    category: "Perlengkapan Mandi & Cuci",
    unit: "pcs",
    defaultQty: 1,
    lastMonthPrice: 14500,
    unitPerPackage: 1,
    notes: "Refill cuci piring & wajan"
  }
];

export const DEFAULT_SHOPPING_SESSION = {
  location: "Lotte Mart Grocery - Puri Indah",
  date: "2026-10-28"
};

export const DEFAULT_SHOPPING_HISTORY = [
  {
    id: "hist-2026-09",
    date: "2026-09-01",
    monthName: "September 2026",
    location: "Lotte Mart Grocery - Puri Indah",
    budgetCap: 300000,
    totalSpent: 269000,
    itemsCount: 8,
    items: [
      { name: "Beras Ramos Super", category: "Makanan Pokok", unit: "kg", qty: 5, price: 68000, discountStr: "0", finalPrice: 68000, subtotal: 68000 },
      { name: "Telur Ayam Negeri", category: "Makanan Pokok", unit: "kg", qty: 1, price: 28000, discountStr: "0", finalPrice: 28000, subtotal: 28000 },
      { name: "Minyak Goreng Refill", category: "Bumbu & Minyak", unit: "liter", qty: 2, price: 36000, discountStr: "0", finalPrice: 36000, subtotal: 36000 },
      { name: "Deterjen Bubuk Cuci Baju", category: "Perlengkapan Mandi & Cuci", unit: "pack", qty: 1, price: 22000, discountStr: "0", finalPrice: 22000, subtotal: 22000 },
      { name: "Sabun Mandi Batang (Isi 4)", category: "Perlengkapan Mandi & Cuci", unit: "pack", qty: 1, price: 14000, discountStr: "0", finalPrice: 14000, subtotal: 14000 },
      { name: "Pasta Gigi Herbal 190g", category: "Perlengkapan Mandi & Cuci", unit: "pcs", qty: 1, price: 16500, discountStr: "0", finalPrice: 16500, subtotal: 16500 },
      { name: "Mie Instan Goreng (Isi 10)", category: "Makanan Instan", unit: "pack", qty: 1, price: 30000, discountStr: "0", finalPrice: 30000, subtotal: 30000 },
      { name: "Pembersih Lantai Karbol", category: "Perlengkapan Mandi & Cuci", unit: "pcs", qty: 1, price: 18500, discountStr: "0", finalPrice: 18500, subtotal: 18500 },
      { name: "Ikan Sarden Saus Tomat 425g", category: "Makanan Instan", unit: "kaleng", qty: 1, price: 24000, discountStr: "0", finalPrice: 24000, subtotal: 24000 },
      { name: "Sabun Cuci Piring Jeruk Nipis 700ml", category: "Perlengkapan Mandi & Cuci", unit: "pcs", qty: 1, price: 14500, discountStr: "5%", finalPrice: 13775, subtotal: 13775 }
    ]
  }
];

export const CATEGORIES = [
  "Makanan Pokok",
  "Bumbu & Minyak",
  "Perlengkapan Mandi & Cuci",
  "Makanan Instan",
  "Camilan & Minuman",
  "Lain-lain"
];

export const UNITS = [
  "pcs",
  "kg",
  "gram",
  "liter",
  "ml",
  "pack",
  "kaleng",
  "botol",
  "dus"
];

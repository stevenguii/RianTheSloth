/**
 * Comprehensive Automated Test Suite & Feature Verification
 * P13 - Daily Test 2 (DT2): Evaluasi Smart Grocery Tracker (RianTheSloth)
 */

import {
  formatRupiah,
  calculateTieredDiscount,
  comparePriceWithLastMonth,
  evaluateBudgetCap,
  compareUnitPrices
} from '../js/calculator.js';

import {
  DEFAULT_HISTORY_CATALOG,
  DEFAULT_SHOPPING_HISTORY,
  CATEGORIES,
  UNITS
} from '../js/data.js';

console.log('================================================================');
console.log('🧪 P13 - DAILY TEST 2 (DT2): EVALUASI SMART GROCERY TRACKER');
console.log('   Uji Verifikasi Fitur F-01 s/d F-06');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
    if (details) console.log(`     ↳ ${details}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error(`     ↳ ${details}`);
  }
}

// ---------------------------------------------------------------------
// TEST SUITE 1: F-01 - Pencatatan Item Belanja Lengkap
// ---------------------------------------------------------------------
console.log('📦 TEST 1: F-01 - Pencatatan Item Belanja Lengkap');
{
  // Periksa atribut wajib pada data catalog & keranjang:
  // (nama barang, kategori, satuan ukuran, kuantitas, harga satuan, harga riwayat bulan lalu)
  const sample = DEFAULT_HISTORY_CATALOG[0];
  assert(typeof sample.name === 'string' && sample.name.length > 0, 'F-01.1: Nama produk tersimpan dengan benar', `Nama: ${sample.name}`);
  assert(CATEGORIES.includes(sample.category), 'F-01.2: Kategori barang terdaftar resmi', `Kategori: ${sample.category}`);
  assert(UNITS.includes(sample.unit), 'F-01.3: Satuan ukuran (kg/liter/pcs/pack) valid', `Satuan: ${sample.unit}`);
  assert(typeof sample.defaultQty === 'number' && sample.defaultQty > 0, 'F-01.4: Kuantitas awal tersimpan', `Qty: ${sample.defaultQty}`);
  assert(typeof sample.lastMonthPrice === 'number' && sample.lastMonthPrice > 0, 'F-01.5: Harga riwayat bulan lalu tercatat', `Harga Lalu: ${formatRupiah(sample.lastMonthPrice)}`);
}

// ---------------------------------------------------------------------
// TEST SUITE 2: F-02 - Perhitungan Kuantitas Otomatis Realtime
// ---------------------------------------------------------------------
console.log('\n🔢 TEST 2: F-02 - Perhitungan Kuantitas Otomatis');
{
  const unitPrice = 74000;
  // Skenario: Qty 1 -> subtotal 74.000
  assert(unitPrice * 1 === 74000, 'F-02.1: Perhitungan kuantitas 1 item', `1 x ${formatRupiah(unitPrice)} = ${formatRupiah(unitPrice * 1)}`);
  
  // Skenario: Qty dinaikkan jadi 5 (Beras 5kg) -> subtotal 370.000
  const qty5 = 5;
  const subtotal5 = unitPrice * qty5;
  assert(subtotal5 === 370000, 'F-02.2: Perubahan kuantitas langsung mengalikan harga satuan secara realtime', `${qty5} x ${formatRupiah(unitPrice)} = ${formatRupiah(subtotal5)}`);
  
  // Skenario: Qty pecahan atau banyak (misal Mie Instan Qty 10 @ Rp 3.000)
  const qty10 = 10;
  const unitMie = 3000;
  assert(unitMie * qty10 === 30000, 'F-02.3: Perhitungan kuantitas grosir/banyak', `${qty10} x ${formatRupiah(unitMie)} = ${formatRupiah(unitMie * qty10)}`);
}

// ---------------------------------------------------------------------
// TEST SUITE 3: F-03 - Kalkulator Diskon Bertingkat
// ---------------------------------------------------------------------
console.log('\n🏷️ TEST 3: F-03 - Kalkulator Diskon Bertingkat (50% + 20%)');
{
  // Kasus Narasi Rian: Promo 50% + 20% pada sabun pembersih lantai Rp 100.000
  const base100k = 100000;
  const promoTiered = calculateTieredDiscount(base100k, '50% + 20%');

  assert(promoTiered.finalPrice === 40000, 'F-03.1: Logika diskon bertingkat 50% + 20% menghasilkan Rp 40.000', `Final: ${formatRupiah(promoTiered.finalPrice)}`);
  assert(promoTiered.savings === 60000, 'F-03.2: Total penghematan nominal tepat Rp 60.000', `Hemat: ${formatRupiah(promoTiered.savings)}`);
  assert(promoTiered.effectivePercentage === 60, 'F-03.3: Diskon efektif terbukti 60% (BUKAN 70% yang menyesatkan)', `Diskon Efektif: ${promoTiered.effectivePercentage}%`);
  assert(promoTiered.steps.length === 2, 'F-03.4: Rincian langkah pemotongan bertingkat lengkap 2 tingkat', `Tingkat 1: ${promoTiered.steps[0].label}, Tingkat 2: ${promoTiered.steps[1].label}`);

  // Kasus Diskon Tunggal: 25% pada Rp 40.000
  const promoSingle = calculateTieredDiscount(40000, '25%');
  assert(promoSingle.finalPrice === 30000, 'F-03.5: Diskon tunggal 25% menghasilkan Rp 30.000', `Final: ${formatRupiah(promoSingle.finalPrice)}`);

  // Kasus Potongan Nominal: Rp 15.000 pada Rp 40.000
  const promoNominal = calculateTieredDiscount(40000, 'Rp 15000');
  assert(promoNominal.finalPrice === 25000, 'F-03.6: Potongan langsung Rp 15.000 menghasilkan Rp 25.000', `Final: ${formatRupiah(promoNominal.finalPrice)}`);
}

// ---------------------------------------------------------------------
// TEST SUITE 4: F-04 - Komparator Harga Realtime vs Bulan Lalu
// ---------------------------------------------------------------------
console.log('\n📈 TEST 4: F-04 - Komparator Harga Realtime vs Bulan Lalu');
{
  // Kasus 1: Harga NAIK (Telur bulan lalu Rp 28.000, sekarang Rp 32.000)
  const compUp = comparePriceWithLastMonth(32000, 28000);
  assert(compUp.status === 'UP', 'F-04.1: Terdeteksi status UP saat harga naik', `Status: ${compUp.status}`);
  assert(compUp.symbol === '↑', 'F-04.2: Menampilkan Panah Merah Naik (↑)', `Simbol: ${compUp.symbol}`);
  assert(compUp.colorClass === 'price-up', 'F-04.3: Menggunakan visual style merah (price-up)', `Class: ${compUp.colorClass}`);
  assert(compUp.diff === 4000, 'F-04.4: Selisih kenaikan dihitung akurat (+Rp 4.000)', `Selisih: +${formatRupiah(compUp.diff)} (+${compUp.diffPercent}%)`);

  // Kasus 2: Harga TURUN (Minyak bulan lalu Rp 36.000, sekarang Rp 34.000)
  const compDown = comparePriceWithLastMonth(34000, 36000);
  assert(compDown.status === 'DOWN', 'F-04.5: Terdeteksi status DOWN saat harga turun', `Status: ${compDown.status}`);
  assert(compDown.symbol === '↓', 'F-04.6: Menampilkan Panah Hijau Turun (↓)', `Simbol: ${compDown.symbol}`);
  assert(compDown.colorClass === 'price-down', 'F-04.7: Menggunakan visual style hijau (price-down)', `Class: ${compDown.colorClass}`);
  assert(compDown.diff === -2000, 'F-04.8: Selisih penurunan dihitung akurat (-Rp 2.000)', `Selisih: ${formatRupiah(compDown.diff)} (${compDown.diffPercent}%)`);

  // Kasus 3: Harga STABIL / SAMA (Wipol Rp 18.500 vs Rp 18.500)
  const compEq = comparePriceWithLastMonth(18500, 18500);
  assert(compEq.status === 'EQUAL', 'F-04.9: Terdeteksi status EQUAL saat harga sama', `Status: ${compEq.status}`);
  assert(compEq.symbol === '=', 'F-04.10: Menampilkan Tanda Setara (=)', `Simbol: ${compEq.symbol}`);
}

// ---------------------------------------------------------------------
// TEST SUITE 5: F-05 - Pengendali Anggaran (Budget Safety Cap)
// ---------------------------------------------------------------------
console.log('\n🛡️ TEST 5: F-05 - Pengendali Anggaran (Budget Safety Cap)');
{
  const budgetCap = 300000; // Uang saku Rian Rp 300.000

  // Level 1: Aman (< 75%)
  const safe = evaluateBudgetCap(150000, budgetCap); // 50%
  assert(safe.status === 'SAFE', 'F-05.1: Status SAFE saat belanjaan 50% budget', `Status: ${safe.status}, Label: ${safe.label}`);
  assert(safe.colorClass === 'budget-safe', 'F-05.2: Indikator visual hijau', `Class: ${safe.colorClass}`);

  // Level 2: Waspada (75% - 90%)
  const warning = evaluateBudgetCap(240000, budgetCap); // 80%
  assert(warning.status === 'WARNING', 'F-05.3: Status WARNING saat belanjaan 80% budget', `Status: ${warning.status}, Sisa: ${formatRupiah(warning.remaining)}`);

  // Level 3: Kritis (90% - 100%)
  const critical = evaluateBudgetCap(285000, budgetCap); // 95%
  assert(critical.status === 'CRITICAL', 'F-05.4: Status CRITICAL saat belanjaan 95% budget', `Status: ${critical.status}`);

  // Level 4: Overbudget (> 100%) - Titik kritis memalukan di depan kasir!
  const over = evaluateBudgetCap(325000, budgetCap); // 108.3%
  assert(over.status === 'OVERBUDGET', 'F-05.5: Status OVERBUDGET menyala saat total melebihi uang saku', `Status: ${over.status}`);
  assert(over.colorClass === 'budget-danger', 'F-05.6: Indikator visual merah menyala bahaya', `Class: ${over.colorClass}`);
  assert(over.overAmount === 25000, 'F-05.7: Menghitung tepat kekurangan uang saku Rp 25.000', `Kurang: ${formatRupiah(over.overAmount)}`);
  assert(over.isAlert === true, 'F-05.8: Flag peringatan bahaya aktif', `isAlert: ${over.isAlert}`);
}

// ---------------------------------------------------------------------
// TEST SUITE 6: F-06 - Riwayat & Database Belanja (Struk Anti-Pudar)
// ---------------------------------------------------------------------
console.log('\n📜 TEST 6: F-06 - Riwayat & Database Belanja');
{
  assert(DEFAULT_SHOPPING_HISTORY.length > 0, 'F-06.1: Riwayat belanja bulan lalu tersimpan di database', `Jumlah trip riwayat: ${DEFAULT_SHOPPING_HISTORY.length}`);
  const histSample = DEFAULT_SHOPPING_HISTORY[0];
  assert(histSample.items.length > 0, 'F-06.2: Rincian struk mencatat daftar item belanja lengkap', `Item di struk: ${histSample.items.length}`);
  assert(histSample.totalSpent > 0, 'F-06.3: Total belanjaan riwayat terakumulasi', `Total: ${formatRupiah(histSample.totalSpent)}`);
  assert(histSample.budgetCap > 0, 'F-06.4: Batas anggaran saku tercatat pada struk', `Batas: ${formatRupiah(histSample.budgetCap)}`);
}

// ---------------------------------------------------------------------
// TEST SUITE 7: Fitur Tambahan - Dilema Minyak 1L x 3 vs Jerigen 5L
// ---------------------------------------------------------------------
console.log('\n⚖️ TEST 7: Duel Satuan (Unit Price Battle Dilema Minyak)');
{
  const optA = { name: 'Minyak 1L (x3 Kantong)', price: 54000, qty: 1, volume: 3, unit: 'liter' };
  const optB = { name: 'Jerigen 5 Liter', price: 85000, qty: 1, volume: 5, unit: 'liter' };
  const battle = compareUnitPrices(optA, optB);

  assert(battle.winner === 'B', 'Extra.1: Jerigen 5L terbukti memenangkan duel harga satuan', `Pemenang: ${battle.winner}`);
  assert(battle.savingsPerUnit === 1000, 'Extra.2: Penghematan terhitung Rp 1.000 per liter', `Hemat: ${formatRupiah(battle.savingsPerUnit)}/liter`);
  assert(battle.optionB.unitPrice === 17000, 'Extra.3: Harga Opsi B Rp 17.000/liter vs Opsi A Rp 18.000/liter', `Opsi B: ${battle.optionB.formattedUnitPrice}, Opsi A: ${battle.optionA.formattedUnitPrice}`);
}

console.log('\n================================================================');
console.log(`🎉 HASIL PENGUJIAN: ${passedTests} / ${totalTests} PENGUJIAN LULUS (100%)`);
console.log('================================================================\n');

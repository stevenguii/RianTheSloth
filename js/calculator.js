/**
 * Module Kalkulator & Logika Bisnis Belanja Rian
 * Mengimplementasikan F-02, F-03, F-04, F-05 dan Helper Pembanding Promo
 */

/**
 * Format angka ke format mata uang Rupiah
 * @param {number} amount 
 * @returns {string} Contoh: "Rp 68.000"
 */
export function formatRupiah(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Parsing diskon string fleksibel:
 * Mendukung:
 * - Diskon tunggal: "20%", "25"
 * - Diskon bertingkat/bertumpuk: "50% + 20%", "50+20", "50% + 20% + 5%"
 * - Potongan nominal langsung: "Rp 15000", "potongan 15000"
 * 
 * Logika Diskon Bertingkat (F-03):
 * Promo 50% + 20%:
 * Harga awal dipotong 50%, lalu sisa harganya dipotong lagi 20%.
 * Rumus: P_final = P0 * (1 - d1/100) * (1 - d2/100) ...
 * 
 * @param {number} originalPrice 
 * @param {string|number} discountInput 
 * @returns {object} Detail kalkulasi diskon
 */
export function calculateTieredDiscount(originalPrice, discountInput) {
  const basePrice = Math.max(0, Number(originalPrice) || 0);
  if (!discountInput || basePrice === 0) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice,
      savings: 0,
      effectivePercentage: 0,
      steps: [],
      description: "Tanpa diskon"
    };
  }

  const inputStr = String(discountInput).trim();

  // Cek apakah input berupa potongan nominal langsung (misal: "Rp 15000" atau angka tanpa %)
  // Jika formatnya diawali "rp" atau kata "potongan" atau "cashback"
  const isDirectNominal = /^(rp|potongan|cashback|-)/i.test(inputStr);
  if (isDirectNominal) {
    const nominalMatch = inputStr.replace(/[^0-9]/g, "");
    const cutAmount = Number(nominalMatch) || 0;
    const finalPrice = Math.max(0, basePrice - cutAmount);
    const savings = basePrice - finalPrice;
    const effectivePercentage = basePrice > 0 ? (savings / basePrice) * 100 : 0;
    return {
      originalPrice: basePrice,
      finalPrice,
      savings,
      effectivePercentage: Math.round(effectivePercentage * 10) / 10,
      steps: [
        { label: `Potongan langsung ${formatRupiah(cutAmount)}`, priceAfter: finalPrice }
      ],
      description: `Potongan Langsung ${formatRupiah(cutAmount)}`
    };
  }

  // Cek persentase bertingkat (misal: "50% + 20%", "50+20", "30% + 10% + 5%")
  // Ekstrak semua angka persentase
  const parts = inputStr.split("+").map(p => {
    const num = parseFloat(p.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  }).filter(n => n > 0);

  if (parts.length === 0) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice,
      savings: 0,
      effectivePercentage: 0,
      steps: [],
      description: "Format diskon tidak valid"
    };
  }

  let currentPrice = basePrice;
  const steps = [];

  parts.forEach((rate, index) => {
    const cut = currentPrice * (rate / 100);
    const after = Math.max(0, currentPrice - cut);
    steps.push({
      tier: index + 1,
      rate,
      cutAmount: cut,
      priceBefore: currentPrice,
      priceAfter: after,
      label: `Tingkat ${index + 1}: Diskon ${rate}% (-${formatRupiah(cut)})`
    });
    currentPrice = after;
  });

  const finalPrice = Math.round(currentPrice);
  const savings = basePrice - finalPrice;
  const effectivePercentage = basePrice > 0 ? (savings / basePrice) * 100 : 0;
  const nominalVsSum = parts.reduce((a, b) => a + b, 0);

  let explanation = "";
  if (parts.length > 1) {
    explanation = `${parts.join("% + ")}% = Diskon efektif ${effectivePercentage.toFixed(1)}% (Bukan ${nominalVsSum}%!)`;
  } else {
    explanation = `Diskon ${parts[0]}% (-${formatRupiah(savings)})`;
  }

  return {
    originalPrice: basePrice,
    finalPrice,
    savings,
    effectivePercentage: Math.round(effectivePercentage * 10) / 10,
    steps,
    description: explanation,
    isTiered: parts.length > 1,
    tierSummary: parts.join("% + ") + "%"
  };
}

/**
 * Logika Komparator Harga Realtime vs Bulan Lalu (F-04)
 * Menghasilkan visual indicator dan saran aksi untuk Rian di lorong supermarket
 * 
 * @param {number} currentPrice - Harga satuan saat ini
 * @param {number|null} lastMonthPrice - Harga satuan bulan lalu
 * @returns {object} Analisis fluktuasi harga
 */
export function comparePriceWithLastMonth(currentPrice, lastMonthPrice) {
  const current = Number(currentPrice) || 0;
  const last = lastMonthPrice !== null && lastMonthPrice !== undefined ? Number(lastMonthPrice) : null;

  if (last === null || isNaN(last) || last <= 0) {
    return {
      status: "NEW",
      symbol: "★",
      colorClass: "price-new",
      badgeText: "Item Baru",
      diff: 0,
      diffPercent: 0,
      advice: "Barang baru dalam daftar belanja. Harga saat ini akan disimpan sebagai riwayat untuk bulan depan."
    };
  }

  const diff = current - last;
  const diffPercent = ((diff / last) * 100);

  if (diff > 0) {
    return {
      status: "UP",
      symbol: "↑",
      colorClass: "price-up",
      badgeText: `Naik ${formatRupiah(diff)} (+${diffPercent.toFixed(1)}%)`,
      diff,
      diffPercent: Math.round(diffPercent * 10) / 10,
      advice: `⚠️ Harga naik tajam dibanding bulan lalu (${formatRupiah(last)}). Pertimbangkan kurangi kuantitas atau cari alternatif merek lain!`
    };
  } else if (diff < 0) {
    const absDiff = Math.abs(diff);
    const absPercent = Math.abs(diffPercent);
    return {
      status: "DOWN",
      symbol: "↓",
      colorClass: "price-down",
      badgeText: `Turun ${formatRupiah(absDiff)} (-${absPercent.toFixed(1)}%)`,
      diff,
      diffPercent: -Math.round(absPercent * 10) / 10,
      advice: `🔥 Harga sedang turun dari ${formatRupiah(last)}! Kesempatan bagus untuk dibeli atau distok jika uang saku cukup.`
    };
  } else {
    return {
      status: "EQUAL",
      symbol: "=",
      colorClass: "price-equal",
      badgeText: "Harga Stabil (=)",
      diff: 0,
      diffPercent: 0,
      advice: `✓ Harga sama persis dengan bulan lalu (${formatRupiah(last)}).`
    };
  }
}

/**
 * Logika Pengendali Anggaran / Safety Cap (F-05)
 * Memonitor total belanjaan vs kapasitas dompet Rian
 * 
 * @param {number} totalSpent - Total akumulasi belanjaan keranjang
 * @param {number} budgetCap - Batas maksimal uang saku/tunai yang dibawa
 * @returns {object} Status safety cap
 */
export function evaluateBudgetCap(totalSpent, budgetCap) {
  const total = Math.max(0, Number(totalSpent) || 0);
  const cap = Math.max(0, Number(budgetCap) || 0);

  if (cap === 0) {
    return {
      status: "NO_CAP",
      colorClass: "budget-neutral",
      percent: 0,
      remaining: 0,
      label: "Batas Belum Diatur",
      advice: "Masukkan batas uang saku tunai agar terhindar dari rasa malu di depan kasir!"
    };
  }

  const remaining = cap - total;
  const percent = Math.min(200, (total / cap) * 100);

  if (percent > 100) {
    const overAmount = total - cap;
    return {
      status: "OVERBUDGET",
      colorClass: "budget-danger",
      isAlert: true,
      percent,
      remaining,
      overAmount,
      label: `BAHAYA OVERBUDGET! (${percent.toFixed(0)}%)`,
      advice: `⛔ Total belanja melebihi uang saku sebesar ${formatRupiah(overAmount)}! Segera batalkan atau kurangi item sebelum sampai di depan kasir!`
    };
  } else if (percent >= 90) {
    return {
      status: "CRITICAL",
      colorClass: "budget-critical",
      isAlert: true,
      percent,
      remaining,
      label: `Sangat Kritis! (${percent.toFixed(0)}%)`,
      advice: `⚠️ Sisa uang tinggal ${formatRupiah(remaining)}! Jangan ambil barang tambahan lagi.`
    };
  } else if (percent >= 75) {
    return {
      status: "WARNING",
      colorClass: "budget-warning",
      isAlert: false,
      percent,
      remaining,
      label: `Waspada Limit (${percent.toFixed(0)}%)`,
      advice: `⚡ Sudah menghabiskan ${percent.toFixed(0)}% dari anggaran. Sisa uang tunai: ${formatRupiah(remaining)}.`
    };
  } else {
    return {
      status: "SAFE",
      colorClass: "budget-safe",
      isAlert: false,
      percent,
      remaining,
      label: `Anggaran Aman (${percent.toFixed(0)}%)`,
      advice: `✅ Pengeluaran aman. Sisa uang di dompet: ${formatRupiah(remaining)}.`
    };
  }
}

/**
 * Helper Komparator Satuan / Unit Price Calculator
 * Mengatasi kebingungan Rian:
 * "Apakah lebih hemat membeli minyak goreng kemasan 1 liter seharga Rp 18.000 sebanyak 3 kantong (total 3L = Rp 54.000),
 * atau langsung membeli jerigen 5 liter seharga Rp 85.000?"
 * 
 * @param {object} optionA - { name, price, qty, volume, unit }
 * @param {object} optionB - { name, price, qty, volume, unit }
 * @returns {object} Rekomendasi opsi mana yang lebih murah per satuan
 */
export function compareUnitPrices(optionA, optionB) {
  const totalVolumeA = (Number(optionA.qty) || 1) * (Number(optionA.volume) || 1);
  const totalVolumeB = (Number(optionB.qty) || 1) * (Number(optionB.volume) || 1);

  const priceA = Number(optionA.price) || 0;
  const priceB = Number(optionB.price) || 0;

  const unitPriceA = totalVolumeA > 0 ? priceA / totalVolumeA : 0;
  const unitPriceB = totalVolumeB > 0 ? priceB / totalVolumeB : 0;

  let winner = null;
  let savingsPerUnit = 0;
  let diffPercent = 0;
  let summary = "";

  if (unitPriceA < unitPriceB) {
    winner = "A";
    savingsPerUnit = unitPriceB - unitPriceA;
    diffPercent = ((savingsPerUnit / unitPriceB) * 100);
    summary = `Opsi A (${optionA.name}) lebih hemat ${formatRupiah(savingsPerUnit)} per ${optionA.unit} (${diffPercent.toFixed(1)}% lebih murah)!`;
  } else if (unitPriceB < unitPriceA) {
    winner = "B";
    savingsPerUnit = unitPriceA - unitPriceB;
    diffPercent = ((savingsPerUnit / unitPriceA) * 100);
    summary = `Opsi B (${optionB.name}) lebih hemat ${formatRupiah(savingsPerUnit)} per ${optionB.unit} (${diffPercent.toFixed(1)}% lebih murah)!`;
  } else {
    winner = "EQUAL";
    summary = `Kedua opsi memiliki harga satuan yang sama persis (${formatRupiah(unitPriceA)}/${optionA.unit}).`;
  }

  return {
    optionA: {
      ...optionA,
      totalVolume: totalVolumeA,
      unitPrice: unitPriceA,
      formattedUnitPrice: `${formatRupiah(unitPriceA)}/${optionA.unit}`
    },
    optionB: {
      ...optionB,
      totalVolume: totalVolumeB,
      unitPrice: unitPriceB,
      formattedUnitPrice: `${formatRupiah(unitPriceB)}/${optionB.unit}`
    },
    winner,
    savingsPerUnit,
    diffPercent: Math.round(diffPercent * 10) / 10,
    summary
  };
}

# 📊 Smart Grocery & Budget Safety Tracker (Excel / Spreadsheet Edition)

Aplikasi pelacak belanja supermarket dan batas aman anggaran bulanan (*Safety Cap*) anak kos yang kini hadir dengan antarmuka bertema **Microsoft Excel / Office Spreadsheet Workspace** (`Smart_Grocery_Tracker.xlsx`), menggabungkan presisi tabel akuntansi dengan seluruh fitur fungsionalitas cerdas.

---

## 🖥️ Konsep Tampilan Microsoft Excel / Office Spreadsheet

1. **Excel Top Title Bar (Signature Dark Green `#0e6a37`)**:
   - Menampilkan judul dokumen `📊 Smart_Grocery_Tracker.xlsx - Excel (AutoSave ON)`.
   - Jam realtime berbasis monospaced digital font dan indikator online Excel cloud.
2. **Formula Bar & KPI Dashboard Card (F-05 Safety Cap)**:
   - Panel formula `fx | =SUM(Troli)` yang mencerminkan cara kerja spreadsheet otomatis.
   - Status anggaran bergaya **Excel Conditional Formatting**:
     - *ZONA AMAN*: Cell hijau muda (`#c6efce`) dengan teks hijau tua (`#0e6a37`).
     - *WASPADA*: Cell kuning muda (`#ffeb9c`) dengan teks cokelat tua (`#9c5700`).
     - *BAHAYA OVERBUDGET*: Cell merah muda (`#ffc7ce`) dengan teks merah tua (`#9c0006`).
   - Progress bar gaya *Excel Data Bar*.
3. **Spreadsheet Grid Cells (F-01, F-02, F-03, F-04)**:
   - Baris item belanja tersusun rapi dengan batas garis sel kisi (*gridlines* `#e1dfdd`) khas lembar kerja Excel.
   - Angka moneter diformat menggunakan font monospace akuntansi yang sejajar rapi.
   - Stepper kuantitas yang responsif mengalikan subtotal baris item secara realtime.
4. **Excel Worksheet Tabs di Bagian Bawah**:
   - Tab navigasi bawah ditransformasikan menjadi lembar kerja Excel klasik:
     - 🟢 **Sheet 1 (Belanja)**
     - 📋 **Sheet 2 (Riwayat)**
     - ⚙️ **Sheet 3 (Anggaran)**
5. **Office Dialog Box Modals**:
   - Jendela formulir tambah item dan ubah budget tampil layaknya jendela dialog resmi Microsoft Office (*Insert Function / Set Cell Value*).
   - Struk kasir diformat bersih layaknya lembar kerja cetak (*Print Preview Worksheet*).

---

## 🎯 Status Validasi Seluruh Fitur (100% Tetap Berfungsi)

- ✅ **F-01**: Pencatatan item lengkap (nama, kategori, satuan, kuantitas, harga).
- ✅ **F-02**: Perhitungan kuantitas otomatis seketika (`Qty × Harga = Subtotal`).
- ✅ **F-03**: Kalkulator diskon bertingkat (`50% + 20% = Diskon Efektif 60%`).
- ✅ **F-04**: Komparator harga realtime vs bulan lalu (↑ Naik, ↓ Turun, = Setara).
- ✅ **F-05**: Pengendali anggaran saku (*Budget Safety Cap*) dengan data bar dinamis.
- ✅ **F-06**: Struk digital dan sinkronisasi database patokan harga.
- ✅ **Sesi Belanja**: Lokasi belanja disetel ke **Lotte Mart Grocery - Puri Indah** dan tanggal belanja aktif dipilih menggunakan selector tanggal (*date picker*).

---

## 🚀 Akses Server Lokal

Server aktif dan siap diakses melalui browser:
👉 **`http://localhost:3000`**
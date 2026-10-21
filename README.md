# 🦥 RianTheSloth - Smart Groceries Navigator & Budget Safety Cap

Aplikasi web modern pencatatan belanja cerdas yang dirancang khusus untuk memecahkan tiga titik kritis kehidupan bulanan anak kos (**Rian**):
1. **Malu di Depan Kasir**: Total belanjaan melompat melebihi kapasitas uang saku tunai.
2. **Terkecoh Jebakan Promo**: Label diskon bertumpuk (contoh: "Promo 50% + 20%") serta dilema perbandingan harga satuan (contoh: Minyak 1L x 3 vs Jerigen 5L).
3. **Kertas Struk Thermal Cepat Buram/Pudar**: Tidak bisa membuktikan lonjakan harga telur atau beras di lorong supermarket secara seketika.

---

## 📸 Tampilan & Maskot
Aplikasi dilengkapi dengan maskot 3D **"Rian The Sloth"** yang ramah dan siap mendampingi Rian saat mendorong troli di supermarket grosir.

---

## 🎯 Pemetaan Spesifikasi Kebutuhan Sistem (F-01 s/d F-06)

Berdasarkan analisis kebutuhan sistem siswa, berikut adalah 6 fitur target wajib:

| Kode | Nama Fitur Target | Spesifikasi & Perilaku Sistem | Status Validasi |
| :--- | :--- | :--- | :---: |
| **F-01** | **Pencatatan Item Belanja Lengkap** | Menyimpan seluruh atribut wajib barang: Nama Produk, Kategori (Makanan Pokok, Bumbu, Perlengkapan Mandi, dll.), Satuan Ukuran (`kg`, `liter`, `pcs`, `pack`, `kaleng`, `botol`), Kuantitas Beli (Qty), Harga Satuan per item, dan Harga Riwayat Bulan Lalu. | **Wajib Ada (Selesai)** |
| **F-02** | **Perhitungan Kuantitas Otomatis** | Perubahan angka kuantitas (Qty) melalui tombol stepper `+` / `−` atau ketikan langsung secara instan mengalikan harga satuan ke total baris item tanpa perlu menekan tombol kalkulator manual. | **Wajib Ada (Selesai)** |
| **F-03** | **Kalkulator Diskon Bertingkat** | Menghitung diskon bertumpuk secara matematis: promo **"50% + 20%"** berarti harga awal dipotong 50%, lalu sisa harganya dipotong lagi 20% (Diskon Efektif = **60%**, BUKAN 70%). Juga menangani diskon tunggal (contoh: 25%) dan potongan langsung rupiah (contoh: "Rp 15.000"). | **Wajib Ada (Selesai)** |
| **F-04** | **Komparator Harga Realtime vs Bulan Lalu** | Menampilkan indikator visual seketika saat harga diinput di depan rak barang:<br>• **Panah Merah Naik (↑)**: Jika harga naik dibanding bulan lalu (peringatan harga melonjak).<br>• **Panah Hijau Turun (↓)**: Jika harga turun dibanding bulan lalu (sinyal harga murah layak diborong).<br>• **Tanda Setara (=)**: Jika harga stabil/sama persis dengan bulan lalu. | **Wajib Ada (Selesai)** |
| **F-05** | **Pengendali Anggaran (Budget Safety Cap)** | Memantau kapasitas isi dompet tunai Rian secara realtime:<br>• **Hijau (0 - 75%)**: Status Aman.<br>• **Kuning (75 - 90%)**: Status Waspada Limit.<br>• **Orange (90 - 100%)**: Status Kritis Mendekati Batas.<br>• **Merah Berdenyut (> 100%)**: Bahaya Overbudget! Dilengkapi tombol cepat *Urut Harga Termahal* untuk memilih barang yang harus dibatalkan sebelum ke kasir. | **Wajib Ada (Selesai)** |
| **F-06** | **Riwayat & Database Belanja (Struk Anti-Pudar)** | Data belanja tersimpan rapi ke dalam penyimpanan lokal (`LocalStorage` + JSON backup) sehingga tidak pudar. Saat sesi belanja diselesaikan, struk digital dicatat dan harga hari ini otomatis diperbarui menjadi data harga bulan lalu untuk sesi belanja berikutnya. | **Wajib Ada (Selesai)** |

---

## 🧮 Rumus Matematis yang Diimplementasikan

### 1. Rumus Diskon Bertingkat (F-03)
$$\text{Harga Setelah Tingkat 1 } (P_1) = P_0 \times \left(1 - \frac{d_1}{100}\right)$$
$$\text{Harga Setelah Tingkat 2 } (P_2) = P_1 \times \left(1 - \frac{d_2}{100}\right)$$
$$\text{Diskon Efektif (\%)} = \left(\frac{P_0 - P_{\text{akhir}}}{P_0}\right) \times 100\%$$

*Contoh Kasus Rian:*
- Sabun pembersih lantai harga awal Rp 25.000 dengan promo "50% + 20%":
  - Tingkat 1 (50%): Rp 25.000 - Rp 12.500 = Rp 12.500
  - Tingkat 2 (20%): Rp 12.500 - Rp 2.500 = **Rp 10.000**
  - Total penghematan: Rp 15.000 (Diskon efektif: 60%).

### 2. Komparator Satuan / Unit Price Battle
$$\text{Harga per Satuan} = \frac{\text{Total Harga}}{\text{Jumlah Unit} \times \text{Volume per Unit}}$$

*Contoh Kasus Rian:*
- **Opsi A**: Minyak 1 Liter x 3 kantong seharga Rp 18.000 x 3 = Rp 54.000 $\rightarrow$ **Rp 18.000 / Liter**
- **Opsi B**: Jerigen 5 Liter seharga Rp 85.000 $\rightarrow$ **Rp 17.000 / Liter**
- **Hasil**: Opsi B lebih hemat **Rp 1.000 per Liter** (Penghematan total Rp 5.000 untuk 5 Liter).

---

## 📁 Struktur Berkas

```
RianTheSloth/
├── index.html            # Aplikasi Single Page Web App & layout responsif
├── css/
│   └── style.css         # Desain modern glassmorphism, animasi pulse, thermal receipt styling
├── js/
│   ├── app.js            # Controller utama, event listeners, modal logic, Web Audio SFX
│   ├── calculator.js     # Engine perhitungan F-02, F-03, F-04, F-05, dan Unit Price Duel
│   ├── data.js           # Dataset default sembako kos & riwayat bulan lalu
│   └── storage.js        # Modul persistensi LocalStorage, arsip struk, ekspor/impor JSON
├── assets/
│   └── rian-sloth.jpg    # Maskot 3D Rian The Sloth
├── server.js             # HTTP Dev Server ringan berbasis Node.js standar
└── README.md             # Dokumentasi lengkap
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dapat dijalankan dengan 2 cara:

### Cara 1: Menggunakan Local Server (Direkomendasikan)
Di terminal PowerShell / Command Prompt:
```bash
node server.js
```
Buka browser di alamat:
```
http://localhost:3000
```

### Cara 2: Buka Langsung File HTML
Buka file `index.html` langsung di browser Chrome / Edge / Firefox modern mana pun.
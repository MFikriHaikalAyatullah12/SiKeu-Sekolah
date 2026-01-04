# 📊 Fitur Import Excel - SiKeu Sekolah

## Overview

Fitur Import Excel memungkinkan Anda untuk mengimport data transaksi dalam jumlah besar dari file Excel (.xlsx, .xls) atau CSV. Sistem akan secara otomatis:
- ✅ Mengelompokkan transaksi ke pemasukan/pengeluaran
- ✅ Membuat atau menggunakan kategori yang sesuai
- ✅ Generate nomor kwitansi otomatis
- ✅ Membuat file PDF kwitansi untuk setiap transaksi
- ✅ Menyimpan semua data ke database

## Format Excel yang Diperlukan

File Excel harus memiliki kolom-kolom berikut (urutan tidak harus sama, nama kolom case-insensitive):

### Kolom Wajib:
1. **Tanggal** (Date/tanggal/date)
   - Format: DD/MM/YYYY atau DD-MM-YYYY
   - Contoh: 01/01/2026, 15-06-2026

2. **Keterangan** (Description/keterangan/description/Deskripsi)
   - Deskripsi transaksi
   - Contoh: "Pembayaran SPP Bulan Januari", "Pembelian ATK"

3. **Nominal** (Amount/Jumlah/nominal/amount)
   - Jumlah uang (boleh dengan atau tanpa separator)
   - Contoh: 500000, 1.500.000, 1500000

### Kolom Opsional:
4. **Dari/Kepada** (From/To/dari_kepada/fromTo/Nama/Name)
   - Nama pihak yang terkait (pembayar/penerima)
   - Jika kosong, akan menggunakan keterangan

5. **Akun COA** (COA/Account/akun/account)
   - Nama atau kode akun Chart of Accounts
   - Contoh: "Pendapatan SPP", "4110"

6. **Kategori** (Category/kategori/category)
   - Nama kategori transaksi
   - Jika tidak ada, akan dibuat otomatis

7. **Metode Pembayaran** (Payment Method/payment_method/Metode)
   - Nilai: CASH, BANK_TRANSFER, atau QRIS
   - Default: CASH

## Contoh Template Excel

```csv
Tanggal,Keterangan,Nominal,Dari/Kepada,Akun COA,Kategori,Metode Pembayaran
01/01/2026,Pembayaran SPP,500000,Ahmad Rizki,Pendapatan SPP,Pemasukan SPP,CASH
02/01/2026,Pembelian ATK,150000,Toko Makmur,Beban Operasional,Pengeluaran Operasional,BANK_TRANSFER
03/01/2026,Donasi,1000000,PT Maju Jaya,Pendapatan Lain-lain,Pemasukan Donasi,BANK_TRANSFER
05/01/2026,Gaji Guru,5000000,Pembayaran Gaji,Beban Gaji,Pengeluaran Gaji,BANK_TRANSFER
10/01/2026,Uang Sekolah,750000,Siti Nurhaliza,Pendapatan SPP,Pemasukan SPP,QRIS
```

## Cara Penggunaan

### 1. Download Template
- Klik tombol "Download Template" di halaman import
- Template akan berisi format yang benar dengan contoh data

### 2. Isi Data Excel
- Buka template di Microsoft Excel, Google Sheets, atau LibreOffice
- Isi data transaksi sesuai format
- Pastikan tanggal dalam format yang benar
- Nominal boleh menggunakan separator titik atau tanpa separator

### 3. Upload File
- Klik area upload atau drag & drop file Excel
- File maksimal 10MB
- Format yang didukung: .xlsx, .xls, .csv

### 4. Proses Import
- Klik tombol "Upload dan Proses"
- Tunggu hingga proses selesai
- Sistem akan menampilkan hasil import:
  - Total baris yang diproses
  - Jumlah berhasil
  - Jumlah gagal
  - Detail error (jika ada)
  - Daftar transaksi yang berhasil

## Logika Pengelompokan Otomatis

Sistem menentukan apakah transaksi adalah **pemasukan** atau **pengeluaran** berdasarkan:

### 1. Dari Akun COA (Prioritas Tertinggi)
Jika kolom "Akun COA" diisi dan ditemukan di database:
- Tipe COA = REVENUE → **Pemasukan**
- Tipe COA = EXPENSE → **Pengeluaran**

### 2. Dari Keyword Matching
Jika COA tidak ada atau tidak jelas, sistem mencari kata kunci:

**Pemasukan** (INCOME):
- pendapatan, pemasukan, penerimaan
- income, revenue
- spp, uang sekolah
- donasi, bantuan

**Pengeluaran** (EXPENSE):
- pengeluaran, biaya, belanja
- expense, beban
- operasional, gaji, honor

### 3. Default
Jika tidak dapat ditentukan → **Pengeluaran**

## Fitur Otomatis

### 1. Generate Nomor Kwitansi
- Format: KW-{YYYY}{MM}-{000} (dapat disesuaikan di pengaturan sekolah)
- Counter otomatis bertambah
- Reset setiap bulan (jika setting MONTHLY)
- Contoh: KW-202601-001, KW-202601-002, dst.

### 2. Kategori Otomatis
- Jika kategori belum ada → dibuat otomatis
- Jika kategori sudah ada → digunakan kembali
- Tipe kategori disesuaikan dengan tipe transaksi

### 3. Generate Kwitansi PDF
- Setiap transaksi berhasil → PDF kwitansi dibuat otomatis
- Format sesuai template sekolah
- Include QR code untuk verifikasi
- Include header sekolah (logo, nama, alamat)

## Error Handling

Sistem akan menampilkan error detail untuk setiap baris yang gagal:

### Error Umum:
- ❌ **Data tidak lengkap**: Tanggal, Keterangan, atau Nominal kosong
- ❌ **Format tanggal tidak valid**: Format tanggal tidak dikenali
- ❌ **Nominal tidak valid**: Nominal bukan angka atau ≤ 0
- ❌ **Sekolah tidak ditemukan**: User tidak memiliki sekolah

### Contoh Pesan Error:
```
Baris 5: Format tanggal tidak valid (32/13/2026)
Baris 10: Nominal harus lebih dari 0
Baris 15: Data tidak lengkap (perlu: Tanggal, Keterangan, Nominal)
```

## Tips & Best Practices

### ✅ DO:
- Gunakan format tanggal DD/MM/YYYY atau DD-MM-YYYY
- Pastikan semua kolom wajib terisi
- Gunakan nama akun COA yang jelas dan sesuai
- Cek data sebelum upload (tidak ada data kosong)
- Mulai dengan data sedikit untuk testing (5-10 baris)

### ❌ DON'T:
- Jangan gunakan format tanggal lain (MM/DD/YYYY, YYYY-MM-DD)
- Jangan biarkan kolom wajib kosong
- Jangan gunakan karakter spesial berlebihan dalam keterangan
- Jangan upload file terlalu besar (>10MB)

## Contoh Kasus Penggunaan

### Kasus 1: Import SPP Bulanan
Upload Excel berisi 100 siswa yang membayar SPP:
- Kolom: Tanggal, Keterangan, Nominal, Dari/Kepada
- Sistem auto-detect sebagai "Pemasukan" (karena keyword "SPP")
- 100 kwitansi PDF dibuat otomatis
- Data tersimpan ke database

### Kasus 2: Import Pengeluaran Operasional
Upload Excel berisi berbagai pengeluaran:
- ATK, listrik, air, gaji, pemeliharaan
- Sistem auto-detect sebagai "Pengeluaran" (keyword: biaya, beban, dll)
- Kategori dibuat otomatis per jenis pengeluaran
- Kwitansi dibuat untuk setiap item

### Kasus 3: Mixed Transactions
Upload Excel berisi pemasukan dan pengeluaran:
- Sistem otomatis mengelompokkan berdasarkan akun COA atau keyword
- Pemasukan dan pengeluaran dipisah otomatis
- Laporan keuangan otomatis ter-update

## Akses & Permission

| Role | Akses Import Excel |
|------|-------------------|
| Super Admin | ✅ Full Access |
| Treasurer (Bendahara) | ✅ Full Access |
| User | ❌ No Access |

## Technical Details

### API Endpoint
```
POST /api/transactions/import
Content-Type: multipart/form-data
```

### Technologies Used
- **xlsx** - Excel file parsing
- **Prisma** - Database ORM
- **jsPDF** - PDF generation
- **QRCode** - QR code generation
- **Zod** - Data validation

### File Processing Flow
```
1. Upload File → 2. Parse Excel → 3. Validate Data
     ↓
4. Find/Create Category → 5. Determine Type → 6. Create Transaction
     ↓
7. Generate Receipt Number → 8. Generate PDF → 9. Save to Database
```

## Troubleshooting

### Problem: Import gagal semua
**Solution**: 
- Pastikan format Excel sesuai template
- Check kolom wajib terisi semua
- Pastikan format tanggal benar

### Problem: Kategori tidak sesuai
**Solution**:
- Isi kolom "Kategori" dengan nama yang jelas
- Atau isi kolom "Akun COA" untuk pengelompokan otomatis lebih akurat

### Problem: Kwitansi tidak ter-generate
**Solution**:
- Check log di console
- Pastikan school profile sudah lengkap (nama, alamat, dll)
- PDF generation berjalan di background, transaksi tetap tersimpan

## Support

Jika mengalami masalah:
1. Check dokumentasi ini
2. Download template dan coba dengan data sample
3. Contact Super Admin atau IT Support

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Author**: SiKeu Sekolah Development Team

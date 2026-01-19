# Fitur Upload Bukti Transaksi

## Deskripsi
Fitur ini memungkinkan pengguna untuk mengupload gambar bukti transaksi saat menambahkan pemasukan atau pengeluaran.

## Fitur Utama

### 1. Upload Gambar
- Support format: JPG, PNG, GIF, WebP
- Ukuran maksimal: 10MB
- Metode upload: Click to browse atau Drag & Drop

### 2. Preview Gambar
- Gambar yang dipilih akan ditampilkan sebagai preview
- User dapat menghapus gambar yang sudah dipilih

### 3. Tampilan di Detail Transaksi
- Gambar bukti pembayaran ditampilkan di modal detail transaksi
- Gambar dapat diklik untuk membuka di tab baru (ukuran penuh)
- Tampilan responsif dengan max height 96

### 4. Penyimpanan
- Gambar disimpan di `/public/uploads/receipts/`
- Nama file dibuat unik dengan timestamp dan random string
- URL gambar disimpan di database dalam field `receiptFileUrl`

## File yang Dimodifikasi

### Frontend
- **File**: `src/components/dashboard/transaction-content.tsx`
- **Perubahan**:
  - Menambahkan state `imagePreview` untuk preview gambar
  - Update fungsi `handleFileUpload()` dengan validasi tipe file
  - Update fungsi `handleDrop()` untuk drag & drop
  - Update fungsi `resetForm()` untuk reset preview
  - Update fungsi `handleSubmit()` untuk upload gambar ke server
  - Menambahkan UI upload dengan preview

### Backend
- **File**: `src/app/api/upload/route.ts`
- **Perubahan**:
  - Implementasi API endpoint untuk upload file
  - Validasi tipe file dan ukuran
  - Generate nama file unik
  - Simpan file ke sistem file

### Database
- Field `receiptFileUrl` sudah ada di model `Transaction` di schema Prisma
- API transactions sudah mendukung field ini

### Konfigurasi
- **File**: `.gitignore`
- **Perubahan**: Menambahkan rule untuk tidak commit file upload

## Cara Penggunaan

1. Buka halaman Transaksi
2. Pilih tab Pemasukan atau Pengeluaran
3. Isi form transaksi
4. Di bagian "Bukti Transaksi (Opsional)":
   - Klik area upload untuk browse file, atau
   - Drag & drop gambar ke area upload
5. Preview gambar akan muncul
6. Klik tombol X untuk menghapus gambar jika salah
7. Klik "Simpan Transaksi" atau "Simpan & Cetak Kwitansi"

## Validasi

### Client-side
- Tipe file harus: JPG, PNG, GIF, atau WebP
- Ukuran file maksimal 10MB

### Server-side
- Autentikasi user harus valid
- Validasi ulang tipe file dan ukuran
- Generate nama file unik untuk mencegah konflik

## Cara Melihat Bukti Pembayaran

1. Klik ikon mata (👁️) pada transaksi di daftar transaksi
2. Modal detail transaksi akan terbuka
3. Jika ada bukti pembayaran, gambar akan ditampilkan di bagian bawah detail
4. Klik gambar untuk membuka di tab baru dan melihat ukuran penuh

## Direktori Upload
```
public/
  uploads/
    receipts/
      .gitkeep
      receipt_1234567890_abc123.jpg
      receipt_1234567891_def456.png
```

## Keamanan
- File upload memerlukan autentikasi
- Validasi tipe file di client dan server
- Validasi ukuran file
- Nama file di-generate secara unik untuk mencegah overwrite

## URL Akses Gambar
Gambar dapat diakses melalui:
```
/uploads/receipts/receipt_1234567890_abc123.jpg
```

## Catatan
- Field upload adalah opsional
- Gambar tidak wajib diupload untuk menyimpan transaksi
- Jika upload gagal, transaksi tidak akan disimpan

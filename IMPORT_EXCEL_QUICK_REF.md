# 📋 Quick Reference - Import Excel

## 🎯 Format Kolom Excel

| Kolom | Wajib? | Format | Contoh |
|-------|--------|--------|--------|
| **Tanggal** | ✅ Ya | DD/MM/YYYY atau DD-MM-YYYY | 01/01/2026 |
| **Keterangan** | ✅ Ya | Teks bebas | Pembayaran SPP Januari |
| **Nominal** | ✅ Ya | Angka (boleh ada separator) | 500000 atau 500.000 |
| **Dari/Kepada** | ❌ Tidak | Teks bebas | Ahmad Rizki |
| **Akun COA** | ❌ Tidak | Nama/kode COA | Pendapatan SPP atau 4110 |
| **Kategori** | ❌ Tidak | Nama kategori | Pemasukan SPP |
| **Metode Pembayaran** | ❌ Tidak | CASH / BANK_TRANSFER / QRIS | CASH |

## 🤖 Keyword Auto-Detect

### Pemasukan (INCOME)
```
pendapatan | pemasukan | penerimaan | income | revenue
spp | uang sekolah | donasi | bantuan
```

### Pengeluaran (EXPENSE)
```
pengeluaran | biaya | belanja | expense | beban
operasional | gaji | honor
```

## ✅ Checklist Sebelum Upload

- [ ] File format: .xlsx, .xls, atau .csv
- [ ] Kolom Tanggal diisi dengan format DD/MM/YYYY
- [ ] Kolom Keterangan terisi semua
- [ ] Kolom Nominal terisi dan > 0
- [ ] Tidak ada baris kosong di tengah data
- [ ] Nama kolom sesuai (case insensitive OK)

## 🚀 Langkah Cepat

1. Download template
2. Isi data
3. Upload file
4. Klik "Upload dan Proses"
5. ✅ Selesai!

## 📊 Hasil yang Didapat

✅ Transaksi tersimpan ke database  
✅ Nomor kwitansi dibuat otomatis  
✅ Kwitansi PDF dibuat otomatis  
✅ Kategori dibuat jika belum ada  
✅ Tipe transaksi ditentukan otomatis  

## ⚠️ Common Errors

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Data tidak lengkap" | Kolom wajib kosong | Isi Tanggal, Keterangan, Nominal |
| "Format tanggal tidak valid" | Format tanggal salah | Gunakan DD/MM/YYYY |
| "Nominal harus lebih dari 0" | Nominal 0 atau negatif | Isi nominal > 0 |
| "School ID not found" | User tidak punya sekolah | Contact admin |

## 💡 Tips

- Gunakan Excel atau Google Sheets untuk edit
- Copy-paste dari sistem lama ke template
- Test dengan 5-10 baris dulu
- Check hasil sebelum upload banyak data
- Backup data lama sebelum import

## 🔗 Link Penting

- Menu: Dashboard → Import Excel
- Path: `/dashboard/import`
- API: `POST /api/transactions/import`
- Template: `/public/template-import-transaksi.csv`

---

**💪 Siap import ratusan transaksi dalam sekali klik!**

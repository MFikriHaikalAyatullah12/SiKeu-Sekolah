# 🔍 Panduan Debug Dashboard Bendahara Kosong

## Masalah
Dashboard Bendahara menampilkan Rp 0 semua dan grafik lingkaran kosong, padahal Super Admin ada data 3 bulan terakhir.

## Langkah Debug

### 1. Buka endpoint debug (sebagai Super Admin)
```
http://localhost:3000/api/debug/bendahara
```

Atau jika deployed:
```
https://[your-domain]/api/debug/bendahara
```

### 2. Periksa Response JSON

#### Scenario A: Bendahara Belum Di-Assign
```json
{
  "bendahara": {
    "id": "...",
    "email": "bendahara@example.com",
    "name": "Bendahara",
    "schoolProfileId": null  ← MASALAH!
  },
  "error": "Bendahara not assigned to any school",
  "availableSchools": [
    {
      "id": "school-uuid-123",
      "name": "Universitas Muhammadiyah Makassar"
    }
  ]
}
```

**SOLUSI:**
1. Login sebagai Super Admin
2. Buka menu "Users" atau "Pengaturan Pengguna"
3. Cari user Bendahara
4. Edit user tersebut
5. Assign ke sekolah: "Universitas Muhammadiyah Makassar"
6. Save
7. Logout Bendahara dan login ulang
8. Dashboard seharusnya sudah menampilkan data

#### Scenario B: Tidak Ada Transaksi dalam 3 Bulan
```json
{
  "bendahara": {
    "schoolProfileId": "school-uuid-123"  ← Ada
  },
  "school": {
    "name": "Universitas Muhammadiyah Makassar"
  },
  "totalTransactions": 10,  ← Ada transaksi
  "transactionsLast3Months": 0,  ← Tapi tidak dalam 3 bulan!
  "dateRange": {
    "from": "2025-10-01T00:00:00.000Z",
    "to": "2026-01-04T23:59:59.999Z"
  }
}
```

**SOLUSI:**
- Data transaksi ada, tapi tanggalnya di luar range 3 bulan terakhir
- Bendahara hanya bisa lihat data dari 1 Oktober 2025 - sekarang
- Transaksi dengan tanggal sebelum Oktober 2025 tidak akan muncul
- **Tambahkan transaksi baru dengan tanggal dalam 3 bulan terakhir**

#### Scenario C: Semuanya OK
```json
{
  "transactionsLast3Months": 3,
  "summary": [
    {
      "type": "INCOME",
      "total": 10000000,
      "count": 2
    },
    {
      "type": "EXPENSE",
      "total": 3000000,
      "count": 1
    }
  ],
  "sampleTransactions": [...]
}
```

**Jika data OK tapi dashboard tetap kosong:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Logout dan login ulang
3. Refresh halaman dashboard (Ctrl+F5)
4. Buka browser console (F12) untuk lihat error

## 3. Check Browser Console

Buka dashboard Bendahara, tekan F12, cari log:
- `📊 Dashboard stats query` - Lihat filter yang digunakan
- `🔢 Transaction counts` - Lihat jumlah data
- `🔒 TREASURER date restriction` - Lihat range tanggal

## 4. Manual Database Check (Advanced)

Jika punya akses ke database:

```sql
-- Check Bendahara user
SELECT id, email, name, role, "schoolProfileId"
FROM users
WHERE role = 'TREASURER';

-- Check transactions for school
SELECT COUNT(*) as total
FROM transactions
WHERE "schoolProfileId" = 'SCHOOL_ID_FROM_ABOVE'
  AND date >= DATE_TRUNC('month', NOW() - INTERVAL '3 months')
  AND date <= NOW();

-- Check summary
SELECT type, SUM(amount) as total, COUNT(*) as count
FROM transactions
WHERE "schoolProfileId" = 'SCHOOL_ID_FROM_ABOVE'
  AND date >= DATE_TRUNC('month', NOW() - INTERVAL '3 months')
  AND date <= NOW()
  AND status = 'PAID'
GROUP BY type;
```

## 5. Kemungkinan Masalah Lain

### Session Tidak Update
- Logout dari semua tab
- Clear cookies
- Login ulang

### Cache Problem
- Hard refresh: Ctrl+Shift+R
- Atau: Clear all browsing data

### API Not Called
- Buka Network tab di DevTools
- Refresh dashboard
- Cari request ke `/api/dashboard/stats`
- Periksa Response

## 6. Contact Support

Jika semua langkah di atas sudah dilakukan dan masih bermasalah, hubungi developer dengan informasi:
1. Screenshot debug endpoint response
2. Screenshot browser console
3. Screenshot network tab showing API response
4. User email Bendahara
5. Nama sekolah yang di-assign

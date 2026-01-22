# Sistem Role & Permission - SiKeu Sekolah

## Hierarki Role

Sistem ini memiliki 4 level role dengan wewenang berbeda:

### 1. 👑 Super Admin
**Wewenang Penuh:**
- ✅ Akses ke semua fitur sistem
- ✅ Mengelola data sekolah (nama, alamat, kontak, dll)
- ✅ Melihat dan mengelola semua sekolah yang terdaftar
- ✅ Mengubah pengaturan global sistem
- ✅ Akses ke halaman "Pengaturan Sekolah"
- ✅ Tidak terikat ke sekolah tertentu

**Akun Default:**
- Email: `sikeusekolah@gmail.com`
- Password: `superadmin123`

### 2. 🔑 Admin
**Wewenang Terbatas:**
- ✅ Mengelola transaksi keuangan sekolah
- ✅ Melihat dan membuat laporan
- ✅ Mengelola pengguna di sekolahnya
- ✅ Mengatur kategori transaksi
- ❌ **TIDAK BISA** mengubah nama sekolah
- ❌ **TIDAK BISA** mengubah data utama sekolah
- ❌ **TIDAK BISA** akses ke sekolah lain

### 3. 💰 Treasurer (Bendahara)
**Wewenang Operasional:**
- ✅ Membuat dan mengelola transaksi
- ✅ Mencetak kwitansi
- ❌ Tidak bisa akses laporan lengkap
- ❌ Tidak bisa kelola pengguna

### 4. 👤 User
**Wewenang Minimal:**
- ✅ Melihat dashboard
- ✅ Melihat transaksi (read-only)
- ❌ Tidak bisa membuat transaksi

---

## Cara Kerja

### Super Admin Login
1. Super Admin login dengan akun `sikeusekolah@gmail.com`
2. Di sidebar, menu **"Pengaturan Sekolah"** akan muncul (hanya untuk Super Admin)
3. Super Admin bisa melihat semua sekolah yang terdaftar
4. Super Admin bisa mengubah nama, alamat, telepon, dan email sekolah

### Admin Login
1. Admin login dengan akun sekolahnya (didapat saat register)
2. Menu "Pengaturan Sekolah" **TIDAK MUNCUL** di sidebar
3. Admin hanya bisa mengelola transaksi dan user di sekolahnya sendiri
4. Admin **TIDAK BISA** mengubah data utama sekolah

---

## API Endpoints

### School Management (Super Admin Only)

#### GET `/api/schools`
Mendapatkan daftar semua sekolah
- **Auth:** Super Admin only
- **Response:** Array of schools dengan user count dan transaction count

#### GET `/api/schools/[id]`
Mendapatkan detail sekolah spesifik
- **Auth:** Super Admin, Admin (hanya sekolahnya sendiri)
- **Response:** School detail dengan users dan statistics

#### PUT `/api/schools/[id]`
Update data sekolah
- **Auth:** Super Admin only
- **Body:**
  ```json
  {
    "name": "Nama Sekolah Baru",
    "address": "Alamat Baru",
    "phone": "(021) 12345678",
    "email": "email@sekolah.sch.id"
  }
  ```

---

## Permission Helper Functions

File: `src/lib/permissions.ts`

```typescript
// Server-side checks
await requireRole(['SUPER_ADMIN']) // Hanya Super Admin
await requireRole(['SUPER_ADMIN', 'ADMIN']) // Super Admin atau Admin

// Client-side checks
RolePermissions.canManageSchoolSettings(role) // true jika SUPER_ADMIN
RolePermissions.canManageUsers(role) // true jika SUPER_ADMIN atau ADMIN
RolePermissions.canManageTransactions(role) // true jika SUPER_ADMIN, ADMIN, atau TREASURER
```

---

## Halaman

### `/dashboard/school-settings`
- **Akses:** Super Admin only
- **Fitur:**
  - Melihat semua sekolah terdaftar
  - Edit nama, alamat, telepon, email sekolah
  - Melihat jumlah user dan transaksi per sekolah
  - Auto-redirect jika bukan Super Admin

---

## Database Schema

```prisma
enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  TREASURER
}

model User {
  // ...
  role UserRole @default(USER)
  schoolProfileId String? // Super Admin = null
  // ...
}
```

---

## Testing

### Test Super Admin:
1. Login: `sikeusekolah@gmail.com` / `superadmin123`
2. Buka `/dashboard/school-settings`
3. Edit nama sekolah
4. Verify perubahan tersimpan

### Test Admin:
1. Login sebagai admin sekolah
2. Coba akses `/dashboard/school-settings`
3. Should redirect ke `/dashboard` dengan error message
4. Verify menu "Pengaturan Sekolah" tidak muncul di sidebar

---

## Migration

Untuk apply perubahan schema:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (jika ada database)
npx prisma migrate dev

# Seed database dengan Super Admin
npx prisma db seed
```

---

## Security Notes

⚠️ **PENTING:**
- Super Admin password harus diganti di production
- Jangan share kredensial Super Admin
- Super Admin bisa akses SEMUA data sekolah
- Pastikan hanya orang terpercaya yang punya akses Super Admin

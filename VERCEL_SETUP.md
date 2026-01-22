# 🚀 Vercel Deployment Setup Guide

## ⚠️ MASALAH: Tidak Bisa Login Setelah Deploy

Jika Anda mengalami masalah tidak bisa login setelah deploy ke Vercel, ikuti langkah-langkah berikut:

---

## 📋 Checklist Perbaikan

### 1️⃣ Set Environment Variables di Vercel

**LANGKAH:**
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **SiKeu-Sekolah**
3. Klik **Settings** → **Environment Variables**
4. Tambahkan semua variable berikut satu per satu:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_y0gLlJG6bEkY@ep-restless-darkness-a1h26fzm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth (PENTING!)
NEXTAUTH_URL=https://sikeu-sekolah.vercel.app
NEXTAUTH_SECRET=9ZiNPfIHj2OgI09Q2aHnHFyecE3vZ8mPPlYxHaDjOo8=

# Application
NEXT_PUBLIC_APP_URL=https://sikeu-sekolah.vercel.app
NEXT_PUBLIC_APP_NAME=SiKeu Sekolah

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

**⚠️ PENTING:**
- **JANGAN** set `NODE_ENV` - Vercel otomatis set ke `production`
- `NEXTAUTH_URL` harus **TANPA trailing slash** (`/`)
- Set untuk environment: **Production**, **Preview**, dan **Development**

---

### 2️⃣ Seed Database Production

Database production Anda masih kosong, perlu di-seed untuk membuat user Super Admin.

**OPTION A: Via Vercel CLI (Recommended)**
```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Login ke Vercel
vercel login

# Link project
vercel link

# Jalankan seed command
vercel env pull .env.local
npx prisma db seed
```

**OPTION B: Via Terminal Lokal**
```bash
# Pastikan .env sudah ada DATABASE_URL production
npx prisma db seed
```

**Output yang diharapkan:**
```
✅ Super Admin user ready: sikeusekolah@gmail.com
✅ School profile created: Sekolah Menengah Atas Negeri 1
✅ Admin user created: admin@smanjakarta.sch.id
✅ Treasurer user created: treasurer@smanjakarta.sch.id
```

---

### 3️⃣ Redeploy Project

Setelah environment variables di-set, **WAJIB REDEPLOY** agar perubahan diterapkan:

**Via Vercel Dashboard:**
1. Klik **Deployments**
2. Pilih deployment terakhir
3. Klik **...** (three dots)
4. Klik **Redeploy**

**Via Git Push:**
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

### 4️⃣ Test Login

Setelah deployment selesai, test login dengan credentials:

```
Email: sikeusekolah@gmail.com
Password: superadmin123
```

**Jika masih gagal:**
1. Buka **Chrome DevTools** (F12) → **Console** tab
2. Cek error messages
3. Buka Vercel Dashboard → **Deployments** → Klik deployment terbaru → **Logs** tab
4. Cek runtime logs untuk error spesifik

---

## 🔍 Troubleshooting

### Problem: "Email atau password salah"
**Solusi:**
- Database belum di-seed → Jalankan `npx prisma db seed`
- Pastikan menggunakan email `sikeusekolah@gmail.com` (bukan username)

### Problem: Stuck di halaman login (tidak redirect)
**Solusi:**
- `NEXTAUTH_URL` di Vercel tidak sama dengan di `.env` → Pastikan exact match
- `NEXTAUTH_SECRET` di Vercel berbeda → Pastikan exact match
- Clear browser cache/cookies

### Problem: Error 500 Internal Server Error
**Solusi:**
- Database connection issue → Check `DATABASE_URL` di Vercel
- Cek Vercel Runtime Logs untuk error detail

### Problem: Session expired terus-menerus
**Solusi:**
- `NEXTAUTH_SECRET` tidak konsisten antar deployment
- Set `NEXTAUTH_SECRET` yang sama untuk semua environments

---

## ✅ Verification Checklist

Sebelum consider "sudah fix", pastikan:

- [ ] Semua environment variables sudah di-set di Vercel
- [ ] `NEXTAUTH_URL` tidak ada trailing slash
- [ ] Database sudah di-seed (Super Admin exists)
- [ ] Project sudah di-redeploy setelah set env vars
- [ ] Bisa login dengan `sikeusekolah@gmail.com` / `superadmin123`
- [ ] Redirect ke `/dashboard` setelah login berhasil
- [ ] Session tidak expired setiap refresh page

---

## 📞 Default Credentials

Setelah seed database, gunakan credentials berikut:

### Super Admin (Akses semua sekolah)
- Email: `sikeusekolah@gmail.com`
- Password: `superadmin123`

### Admin SMAN 1 Jakarta
- Email: `admin@smanjakarta.sch.id`
- Password: `admin123`

### Treasurer SMAN 1 Jakarta
- Email: `treasurer@smanjakarta.sch.id`
- Password: `treasurer123`

---

## 🔐 Security Notes

1. **Ganti password default** setelah first login
2. **Jangan commit** file `.env` atau `.env.production` ke Git
3. **Rotate secrets** secara berkala (NEXTAUTH_SECRET, DATABASE_URL)
4. **Enable 2FA** untuk akun Vercel dan Neon DB

---

## 📚 Related Documentation

- [Next-Auth Configuration](https://next-auth.js.org/configuration/options)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)

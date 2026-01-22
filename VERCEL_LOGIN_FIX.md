# 🔧 Fix Login Issue - Vercel Deployment

## ✅ Perubahan Yang Sudah Dilakukan

### 1. **Auth Configuration Updated** ([src/lib/auth.ts](src/lib/auth.ts))
- ✅ Added `trustHost: true` untuk Vercel
- ✅ Improved cookie configuration untuk production
- ✅ Proper secure cookie names untuk production
- ✅ Added debug mode untuk development

### 2. **Login Handler Improved** ([src/app/auth/signin/page.tsx](src/app/auth/signin/page.tsx))
- ✅ Better error handling
- ✅ Console logging untuk debugging
- ✅ Hard redirect dengan `window.location.href` untuk ensure session loading
- ✅ Proper callback URL handling

---

## 📋 Langkah Deploy ke Vercel

### Step 1: Push Changes ke Git

```bash
git add .
git commit -m "fix: resolve login issues for production deployment"
git push origin main
```

### Step 2: Set Environment Variables di Vercel

**SANGAT PENTING!** Set variable ini di Vercel Dashboard:

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **si-keu-sekolah**
3. Klik **Settings** → **Environment Variables**
4. **Tambahkan/Update** variable berikut:

```env
DATABASE_URL=postgresql://neondb_owner:npg_y0gLlJG6bEkY@ep-restless-darkness-a1h26fzm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_URL=https://si-keu-sekolah.vercel.app

NEXTAUTH_SECRET=sikeu-sekolah-secret-key-2024-production-ready

NEXT_PUBLIC_APP_URL=https://si-keu-sekolah.vercel.app

NEXT_PUBLIC_APP_NAME=SiKeu Sekolah

MAX_FILE_SIZE=5242880

ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

**⚠️ PENTING:**
- Set untuk environment: **Production**, **Preview**, DAN **Development**
- `NEXTAUTH_URL` **HARUS** menggunakan HTTPS
- **JANGAN** ada trailing slash (`/`) di akhir URL
- `NEXTAUTH_SECRET` harus sama dengan yang di local

### Step 3: Redeploy

Setelah set environment variables:

1. Klik **Deployments**
2. Pilih deployment terakhir
3. Klik **...** (three dots)
4. Klik **Redeploy**

**ATAU** via Git push:
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

### Step 4: Verify Deployment

Tunggu 2-3 menit sampai deployment selesai, lalu:

1. Buka https://si-keu-sekolah.vercel.app
2. Klik "Masuk"
3. Login dengan:
   - **Email:** `sikeusekolah@gmail.com`
   - **Password:** `superadmin123`

---

## 🔍 Troubleshooting

### Problem: Masih stuck di halaman login

**Solusi:**
1. Buka Chrome DevTools (F12) → Console tab
2. Lihat console logs:
   - `🔐 Sign in result:` - Cek apakah ada error
   - `✅ Login successful` - Pastikan muncul
3. Cek Network tab → Filter "auth" → Lihat response

### Problem: "NEXTAUTH_URL mismatch" error

**Solusi:**
- Pastikan `NEXTAUTH_URL` di Vercel = `https://si-keu-sekolah.vercel.app`
- **TANPA** trailing slash
- Redeploy setelah update

### Problem: Cookies not saved

**Solusi:**
1. Clear browser cookies untuk domain `si-keu-sekolah.vercel.app`
2. Try login lagi
3. Check browser settings - pastikan cookies enabled

### Problem: Database connection error

**Solusi:**
- Cek `DATABASE_URL` di Vercel settings
- Pastikan Neon database masih active
- Check Vercel Runtime Logs untuk error detail

---

## 🧪 Testing Checklist

Setelah redeploy, test semua ini:

- [ ] Bisa buka landing page (https://si-keu-sekolah.vercel.app)
- [ ] Bisa klik "Masuk" dan form login muncul
- [ ] Login Super Admin berhasil (`sikeusekolah@gmail.com` / `superadmin123`)
- [ ] Redirect ke `/dashboard` setelah login
- [ ] Dashboard content loaded (tidak blank)
- [ ] Bisa navigate ke menu lain (Transactions, Reports, etc.)
- [ ] Session tetap aktif setelah refresh page
- [ ] Bisa logout dan login lagi
- [ ] Login Admin berhasil (`admin@smanjakarta.sch.id` / `admin123`)
- [ ] Login Treasurer berhasil (`treasurer@smanjakarta.sch.id` / `treasurer123`)

---

## 📊 What's Different in Production

| Aspek | Development | Production (Vercel) |
|-------|------------|---------------------|
| NEXTAUTH_URL | http://localhost:3000 | https://si-keu-sekolah.vercel.app |
| Cookie Names | `next-auth.*` | `__Secure-next-auth.*` |
| Cookie Domain | undefined | `.vercel.app` |
| Secure Cookies | false | true |
| Debug Mode | true | false |

---

## ✅ Expected Behavior

Setelah fix ini:

1. ✅ Login form submit → Loading indicator
2. ✅ Console log: "🔐 Sign in result: { ok: true, ... }"
3. ✅ Console log: "✅ Login successful, redirecting to dashboard..."
4. ✅ Hard redirect to `/dashboard`
5. ✅ Dashboard loaded dengan data user
6. ✅ Session tetap aktif (tidak logout otomatis)

---

## 🆘 Still Having Issues?

Jika masih ada masalah:

1. **Cek Vercel Runtime Logs:**
   - Vercel Dashboard → Deployments → Latest → Logs
   - Look for authentication errors

2. **Cek Browser Console:**
   - F12 → Console tab
   - Screenshot errors dan share

3. **Verify Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Pastikan semua variables ada dan benar

4. **Test di Incognito Mode:**
   - Kadang old cookies interfere
   - Test fresh session di incognito

---

**Last Updated:** January 11, 2026

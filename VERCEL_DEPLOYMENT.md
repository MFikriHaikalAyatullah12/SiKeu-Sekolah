# Panduan Deploy ke Vercel

## Masalah yang Sudah Diperbaiki

### Error: Prisma Client Not Generated
Error yang terjadi:
```
Error: Failed to collect page data for /api/auth/[...nextauth]
```

**Penyebab:** Prisma Client tidak di-generate saat build di Vercel.

**Solusi yang Diterapkan:**
1. ✅ Menambahkan `prisma generate` di build script
2. ✅ Menambahkan `postinstall` script untuk auto-generate
3. ✅ Mengoptimalkan logging Prisma untuk production
4. ✅ Membuat konfigurasi Vercel (`vercel.json`)

## Langkah Deploy ke Vercel

### 1. Persiapan Environment Variables di Vercel

Buka dashboard Vercel project Anda, lalu masuk ke **Settings → Environment Variables**, dan tambahkan variabel berikut:

#### Production Variables (Required)
```
DATABASE_URL = postgresql://neondb_owner:npg_y0gLlJG6bEkY@ep-restless-darkness-a1h26fzm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_URL = https://sikeu-sekolah.vercel.app

NEXTAUTH_SECRET = 9ZiNPfIHj2OgI09Q2aHnHFyecE3vZ8mPPlYxHaDjOo8=

NEXT_PUBLIC_APP_URL = https://sikeu-sekolah.vercel.app

NEXT_PUBLIC_APP_NAME = SiKeu Sekolah

NODE_ENV = production
```

#### Optional Variables (Google OAuth)
```
GOOGLE_CLIENT_ID = (kosongkan jika tidak digunakan)
GOOGLE_CLIENT_SECRET = (kosongkan jika tidak digunakan)
```

#### File Upload Settings
```
MAX_FILE_SIZE = 5242880
ALLOWED_FILE_TYPES = image/jpeg,image/png,application/pdf
```

### 2. Push ke Repository

```bash
git add .
git commit -m "fix: resolve Prisma build error on Vercel"
git push origin main
```

### 3. Deploy Otomatis

Vercel akan otomatis mendeteksi push dan melakukan deployment.

### 4. Verifikasi Deployment

1. Tunggu hingga build selesai di Vercel dashboard
2. Buka URL production: https://sikeu-sekolah.vercel.app
3. Test login dengan credentials yang sudah ada di database

## Troubleshooting

### Jika masih error "Prisma Client not generated"

1. **Clear Build Cache di Vercel:**
   - Buka Vercel Dashboard
   - Settings → General → Clear Build Cache
   - Deploy ulang

2. **Pastikan environment variables sudah benar:**
   - `DATABASE_URL` harus menggunakan connection pooler dari Neon
   - `NEXTAUTH_URL` harus menggunakan URL production tanpa trailing slash
   - `NEXTAUTH_SECRET` harus diisi (minimal 32 karakter)

3. **Check Build Logs:**
   ```
   - Cari log "Running prisma generate"
   - Pastikan tidak ada error saat generate
   - Pastikan "next build" berjalan setelah generate
   ```

### Jika error "Can't reach database server"

1. **Pastikan DATABASE_URL benar:**
   - Gunakan **connection pooler** URL dari Neon (bukan direct URL)
   - URL harus include `?sslmode=require`

2. **Pastikan Neon database aktif:**
   - Buka Neon console
   - Pastikan project tidak suspended
   - Pastikan IP Vercel tidak di-block

### Jika error "NEXTAUTH_SECRET not set"

```bash
# Generate new secret
openssl rand -base64 32

# Tambahkan ke Vercel environment variables
```

## File yang Dimodifikasi

### package.json
```json
"scripts": {
  "build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

### src/lib/prisma.ts
- Mengoptimalkan logging untuk production (hanya error log)

### vercel.json (baru)
- Konfigurasi build command untuk Vercel
- Skip env validation saat build

## Monitoring Production

### Check Health
```bash
curl https://sikeu-sekolah.vercel.app/api/health
```

### Check Database Connection
- Monitor logs di Vercel dashboard
- Monitor queries di Neon dashboard

### Performance Monitoring
- Buka Vercel Analytics
- Monitor response time dan error rate

## Best Practices

1. ✅ Selalu test di local sebelum push
2. ✅ Gunakan connection pooler untuk database
3. ✅ Set proper environment variables
4. ✅ Monitor logs setelah deployment
5. ✅ Backup database secara berkala

## Contact & Support

Jika masih ada masalah, check:
- Vercel build logs
- Neon database logs
- Browser console (untuk client-side errors)

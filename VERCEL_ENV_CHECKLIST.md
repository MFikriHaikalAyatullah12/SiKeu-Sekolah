# Vercel Environment Variables Checklist

## ✅ Required (MUST SET)

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_y0gLlJG6bEkY@ep-restless-darkness-a1h26fzm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` | Production |
| `NEXTAUTH_URL` | `https://sikeu-sekolah.vercel.app` | Production |
| `NEXTAUTH_SECRET` | `9ZiNPfIHj2OgI09Q2aHnHFyecE3vZ8mPPlYxHaDjOo8=` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://sikeu-sekolah.vercel.app` | Production |
| `SKIP_ENV_VALIDATION` | `1` | Production |

## 📝 Optional

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_NAME` | `SiKeu Sekolah` | Production |
| `NODE_ENV` | `production` | Production |
| `MAX_FILE_SIZE` | `5242880` | Production |
| `ALLOWED_FILE_TYPES` | `image/jpeg,image/png,application/pdf` | Production |
| `GOOGLE_CLIENT_ID` | (kosongkan jika tidak digunakan) | Production |
| `GOOGLE_CLIENT_SECRET` | (kosongkan jika tidak digunakan) | Production |

## 🔧 Cara Set di Vercel

1. Buka project di Vercel Dashboard
2. Settings → Environment Variables
3. Add untuk setiap variable di atas
4. Select "Production" environment
5. Click "Save"
6. Redeploy jika perlu

## ⚠️ Important Notes

- **DATABASE_URL** harus menggunakan **pooler** URL (ada `-pooler` di hostname)
- **NEXTAUTH_URL** tidak boleh ada trailing slash (`/`)
- **NEXTAUTH_SECRET** minimal 32 karakter (generated dari `openssl rand -base64 32`)
- **SKIP_ENV_VALIDATION=1** penting untuk build di Vercel

## 🧪 Verify After Deploy

```bash
# Test API health
curl https://sikeu-sekolah.vercel.app/api/health

# Test authentication endpoint
curl https://sikeu-sekolah.vercel.app/api/auth/signin
```

## 📞 Support

Jika ada masalah:
1. Check build logs di Vercel
2. Check runtime logs di Vercel
3. Check database di Neon console
4. Lihat DEPLOYMENT_FIX.md untuk troubleshooting

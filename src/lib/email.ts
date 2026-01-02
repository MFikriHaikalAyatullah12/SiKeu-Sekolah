import nodemailer from 'nodemailer'

// Konfigurasi transporter untuk mengirim email
// Gunakan environment variables untuk kredensial SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true untuk port 465, false untuk port lainnya
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface SendWelcomeEmailParams {
  to: string
  name: string
  email: string
  password: string
  role: string
  appName?: string
  loginUrl?: string
}

/**
 * Kirim email selamat datang ke user baru dengan kredensial login
 */
export async function sendWelcomeEmail({
  to,
  name,
  email,
  password,
  role,
  appName = 'SiKeu Sekolah',
  loginUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
}: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  // Jika SMTP tidak dikonfigurasi, skip pengiriman email
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials not configured. Skipping email send.')
    return { success: true } // Return success agar tidak menghalangi pembuatan user
  }

  const roleDisplay = {
    SUPER_ADMIN: 'Super Administrator',
    TREASURER: 'Bendahara',
    BENDAHARA: 'Bendahara',
    ADMIN: 'Administrator',
    USER: 'Pengguna',
  }[role] || role

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akun Anda Telah Terdaftar</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 ${appName}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Sistem Keuangan Sekolah</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #1e40af; margin-top: 0;">Selamat Datang, ${name}! 👋</h2>
    
    <p>Akun Anda telah berhasil didaftarkan di <strong>${appName}</strong>.</p>
    
    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">📋 Detail Akun Anda</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 120px;">Email:</td>
          <td style="padding: 8px 0; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Password:</td>
          <td style="padding: 8px 0; font-weight: 600; font-family: monospace; background: #fef3c7; padding: 4px 8px; border-radius: 4px; display: inline-block;">${password}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Role:</td>
          <td style="padding: 8px 0; font-weight: 600;">${roleDisplay}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}/auth/signin" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        🔐 Login Sekarang
      </a>
    </div>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <p style="margin: 0; color: #dc2626; font-size: 14px;">
        <strong>⚠️ Penting:</strong> Demi keamanan akun Anda, segera ganti password setelah login pertama kali.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">
      Email ini dikirim secara otomatis oleh sistem ${appName}.<br>
      Jika Anda tidak merasa mendaftar, silakan abaikan email ini atau hubungi administrator.
    </p>
  </div>
</body>
</html>
`

  const textContent = `
Selamat Datang di ${appName}!

Halo ${name},

Akun Anda telah berhasil didaftarkan.

Detail Akun:
- Email: ${email}
- Password: ${password}
- Role: ${roleDisplay}

Silakan login di: ${loginUrl}/auth/signin

PENTING: Demi keamanan, segera ganti password setelah login pertama kali.

---
Email ini dikirim secara otomatis oleh sistem ${appName}.
`

  try {
    await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to,
      subject: `🎓 Akun ${appName} Anda Telah Terdaftar`,
      text: textContent,
      html: htmlContent,
    })

    console.log(`Welcome email sent successfully to ${to}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

-- Script untuk assign Bendahara ke sekolah
-- Jalankan query ini di database atau Prisma Studio

-- 1. Cek user Bendahara
SELECT id, email, name, role, "schoolProfileId" 
FROM users 
WHERE role = 'TREASURER';

-- 2. Cek sekolah yang tersedia
SELECT id, name, address 
FROM "schoolProfiles";

-- 3. Update Bendahara dengan schoolProfileId
-- GANTI 'USER_ID' dan 'SCHOOL_ID' dengan ID yang sesuai dari query di atas
UPDATE users 
SET "schoolProfileId" = (
  SELECT id FROM "schoolProfiles" 
  WHERE name LIKE '%Muhammadiyah%' 
  LIMIT 1
)
WHERE role = 'TREASURER';

-- 4. Verifikasi
SELECT u.id, u.email, u.name, u.role, u."schoolProfileId", s.name as school_name
FROM users u
LEFT JOIN "schoolProfiles" s ON u."schoolProfileId" = s.id
WHERE u.role = 'TREASURER';

-- 5. Cek jumlah transaksi dalam 3 bulan terakhir untuk sekolah tersebut
SELECT 
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'INCOME' AND status = 'PAID' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'EXPENSE' AND status = 'PAID' THEN amount ELSE 0 END) as total_expense
FROM transactions
WHERE "schoolProfileId" = (
  SELECT "schoolProfileId" FROM users WHERE role = 'TREASURER' LIMIT 1
)
AND date >= DATE_TRUNC('month', NOW() - INTERVAL '3 months')
AND date <= NOW();

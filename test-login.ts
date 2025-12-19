import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testLogin() {
  console.log('Testing database connection...')
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: 'superadmin@sikeu.com' }
  })
  
  if (!user) {
    console.log('❌ User not found!')
    return
  }
  
  console.log('✅ User found:', {
    email: user.email,
    name: user.name,
    role: user.role,
    hasPassword: !!user.password
  })
  
  // Test password
  const testPassword = 'superadmin123'
  if (user.password) {
    const isMatch = await bcrypt.compare(testPassword, user.password)
    console.log('Password match:', isMatch ? '✅ YES' : '❌ NO')
  } else {
    console.log('❌ No password set!')
  }
  
  await prisma.$disconnect()
}

testLogin()

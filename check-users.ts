import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking users in database...\n')
  
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['superadmin@sikeu.com', 'admin@smanjakarta.sch.id', 'treasurer@smanjakarta.sch.id']
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      password: true,
      schoolProfileId: true,
    }
  })

  console.log(`Found ${users.length} users:\n`)
  users.forEach(user => {
    console.log(`✅ ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   School ID: ${user.schoolProfileId || 'NULL'}`)
    console.log(`   Has password: ${user.password ? 'YES' : 'NO'}`)
    console.log('')
  })

  if (users.length === 0) {
    console.log('❌ No users found! Database might not be seeded.\n')
  }

  await prisma.$disconnect()
}

checkUsers().catch(console.error)

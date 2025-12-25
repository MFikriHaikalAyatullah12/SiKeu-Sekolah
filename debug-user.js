const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugUser() {
  try {
    // Cari user yang sedang login
    const userId = 'cmjjrbo7j0001c2ky4g4b0hod';
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        schoolProfile: true
      }
    });
    
    console.log('👤 User:', user);
    
    // Cari semua sekolah yang ada
    const schools = await prisma.schoolProfile.findMany();
    console.log('🏫 Available schools:', schools.length);
    
    if (schools.length > 0) {
      console.log('First school:', schools[0]);
      
      // Jika user tidak punya schoolId, berikan dia school pertama
      if (!user.schoolProfileId) {
        console.log('⚠️  User has no school, assigning first school...');
        
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { schoolProfileId: schools[0].id },
          include: { schoolProfile: true }
        });
        
        console.log('✅ Updated user:', updatedUser);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser();
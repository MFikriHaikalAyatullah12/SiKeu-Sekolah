import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Mendapatkan data sekolah
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log("📚 Schools API - User:", {
      id: session.user.id,
      role: session.user.role,
      schoolId: session.user.schoolId
    })

    // Super Admin can see all schools
    if (session.user.role === 'SUPER_ADMIN') {
      const schools = await prisma.schoolProfile.findMany({
        include: {
          _count: {
            select: {
              users: true,
              transactions: true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })

      console.log("✅ Returning", schools.length, "schools for Super Admin")
      return NextResponse.json({ schools })
    }
    
    // Other users only see their own school
    if (session.user.schoolId) {
      const school = await prisma.schoolProfile.findUnique({
        where: { id: session.user.schoolId },
        include: {
          _count: {
            select: {
              users: true,
              transactions: true,
            }
          }
        }
      })

      console.log("✅ Returning 1 school for user")
      return NextResponse.json({ schools: school ? [school] : [] })
    }

    // No school assigned
    return NextResponse.json({ schools: [] })
  } catch (error) {
    console.error("Get schools error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data sekolah" },
      { status: 500 }
    )
  }
}

// PUT - Update data sekolah (hanya Super Admin)
export async function PUT(request: Request) {
  try {
    await requireRole(["SUPER_ADMIN"])

    const body = await request.json()
    const { schoolId, name, address, phone, email } = body

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID harus diisi" },
        { status: 400 }
      )
    }

    // Cek apakah email sudah digunakan sekolah lain
    if (email) {
      const existingSchool = await prisma.schoolProfile.findFirst({
        where: {
          email,
          NOT: {
            id: schoolId
          }
        }
      })

      if (existingSchool) {
        return NextResponse.json(
          { error: "Email sekolah sudah digunakan" },
          { status: 400 }
        )
      }
    }

    const updatedSchool = await prisma.schoolProfile.update({
      where: { id: schoolId },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(email && { email }),
      }
    })

    return NextResponse.json({
      message: "Data sekolah berhasil diupdate",
      school: updatedSchool
    })
  } catch (error) {
    console.error("Update school error:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate data sekolah" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Mendapatkan data sekolah aktif berdasarkan user yang login
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ambil data sekolah berdasarkan schoolId dari session user
    const school = await prisma.schoolProfile.findUnique({
      where: { id: session.user.schoolId },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!school) {
      return NextResponse.json(
        { error: "Data sekolah tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error("Get school profile error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data sekolah" },
      { status: 500 }
    )
  }
}

// PUT - Update data sekolah aktif (untuk admin sekolah)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Hanya SUPER_ADMIN dan ADMIN yang bisa update
    if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, phone, email, logoUrl } = body

    console.log("Update school profile request:", { schoolId: session.user.schoolId, body })

    // Validasi input
    if (!name || !address || !phone || !email) {
      return NextResponse.json(
        { error: "Nama, alamat, telepon dan email harus diisi" },
        { status: 400 }
      )
    }

    // Cek apakah email sudah digunakan sekolah lain
    const existingSchool = await prisma.schoolProfile.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.schoolId
        }
      }
    })

    if (existingSchool) {
      return NextResponse.json(
        { error: "Email sudah digunakan oleh sekolah lain" },
        { status: 400 }
      )
    }

    const updatedSchool = await prisma.schoolProfile.update({
      where: { id: session.user.schoolId },
      data: {
        name,
        address,
        phone,
        email,
        logoUrl,
        updatedAt: new Date()
      }
    })

    console.log("School profile updated successfully:", updatedSchool)

    return NextResponse.json({
      message: "Data sekolah berhasil diperbarui",
      school: updatedSchool
    })
  } catch (error) {
    console.error("Update school profile error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal memperbarui data sekolah" },
      { status: 500 }
    )
  }
}
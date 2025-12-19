import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/permissions"

// GET - Mendapatkan detail sekolah berdasarkan ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"])

    const { id } = await params

    const school = await prisma.schoolProfile.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        _count: {
          select: {
            transactions: true,
            categories: true,
          }
        }
      }
    })

    if (!school) {
      return NextResponse.json(
        { error: "Sekolah tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error("Get school error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data sekolah" },
      { status: 500 }
    )
  }
}

// PUT - Update data sekolah spesifik
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN"])

    const { id } = await params
    const body = await request.json()
    const { name, address, phone, email } = body

    console.log("Update school request:", { id, body })

    // Validasi input
    if (!name || !address || !phone || !email) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    // Cek apakah email sudah digunakan sekolah lain
    if (email) {
      const existingSchool = await prisma.schoolProfile.findFirst({
        where: {
          email,
          NOT: {
            id
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
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
      }
    })

    console.log("School updated successfully:", updatedSchool)

    return NextResponse.json({
      message: "Data sekolah berhasil diupdate",
      school: updatedSchool
    })
  } catch (error) {
    console.error("Update school error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengupdate data sekolah" },
      { status: 500 }
    )
  }
}

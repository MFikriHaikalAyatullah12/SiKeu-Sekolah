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

// DELETE - Menghapus sekolah beserta semua data terkait
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["SUPER_ADMIN"])

    const { id } = await params

    console.log("🗑️ Deleting school with ID:", id)

    // Cek apakah sekolah ada
    const school = await prisma.schoolProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            transactions: true,
            categories: true,
            auditLogs: true,
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

    console.log("📊 School data to delete:", {
      name: school.name,
      users: school._count.users,
      transactions: school._count.transactions,
      categories: school._count.categories,
      auditLogs: school._count.auditLogs
    })

    // Hapus semua data terkait dalam urutan yang benar (karena foreign key constraints)
    // Gunakan transaction untuk memastikan semua atau tidak sama sekali
    await prisma.$transaction(async (tx) => {
      // 1. Hapus audit logs
      const deletedAuditLogs = await tx.auditLog.deleteMany({
        where: { schoolProfileId: id }
      })
      console.log(`✅ Deleted ${deletedAuditLogs.count} audit logs`)

      // 2. Hapus transaksi (ini juga akan melepas referensi ke coaAccount)
      const deletedTransactions = await tx.transaction.deleteMany({
        where: { schoolProfileId: id }
      })
      console.log(`✅ Deleted ${deletedTransactions.count} transactions`)

      // 3. Hapus kategori
      const deletedCategories = await tx.category.deleteMany({
        where: { schoolProfileId: id }
      })
      console.log(`✅ Deleted ${deletedCategories.count} categories`)

      // Note: COA (CoaCategory, CoaSubCategory, CoaAccount) adalah data global,
      // tidak terhubung langsung dengan schoolProfile, jadi tidak perlu dihapus

      // 4. Update users - set schoolProfileId ke null (agar user tidak terhapus)
      const updatedUsers = await tx.user.updateMany({
        where: { schoolProfileId: id },
        data: { schoolProfileId: null }
      })
      console.log(`✅ Unlinked ${updatedUsers.count} users from school`)

      // 5. Terakhir, hapus sekolah
      await tx.schoolProfile.delete({
        where: { id }
      })
      console.log(`✅ Deleted school: ${school.name}`)
    })

    return NextResponse.json({
      message: `Sekolah "${school.name}" beserta ${school._count.transactions} transaksi berhasil dihapus`,
      deletedSchool: {
        id: school.id,
        name: school.name,
        transactionsDeleted: school._count.transactions,
        categoriesDeleted: school._count.categories,
        usersUnlinked: school._count.users
      }
    })
  } catch (error) {
    console.error("Delete school error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menghapus sekolah" },
      { status: 500 }
    )
  }
}

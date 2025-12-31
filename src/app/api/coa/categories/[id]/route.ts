import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Delete COA category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Check if category exists
    const category = await prisma.coaCategory.findUnique({
      where: { id },
      include: {
        subCategories: true,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      )
    }

    // Check if category has subcategories
    if (category.subCategories.length > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus kategori yang memiliki sub-kategori. Hapus sub-kategori terlebih dahulu." },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.coaCategory.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Kategori berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting COA category:", error)
    return NextResponse.json(
      { error: "Gagal menghapus kategori" },
      { status: 500 }
    )
  }
}

// PUT - Update COA category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, isActive } = body

    // Check if category exists
    const category = await prisma.coaCategory.findUnique({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      )
    }

    // Update category
    const updatedCategory = await prisma.coaCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error updating COA category:", error)
    return NextResponse.json(
      { error: "Gagal mengupdate kategori" },
      { status: 500 }
    )
  }
}

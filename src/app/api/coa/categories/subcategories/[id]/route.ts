import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

// PUT - Update COA subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can update COA subcategories" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { code, name, description, isActive } = body

    const subcategory = await prisma.coaSubCategory.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("Error updating COA subcategory:", error)
    return NextResponse.json(
      { error: "Failed to update COA subcategory" },
      { status: 500 }
    )
  }
}

// DELETE - Delete COA subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can delete COA subcategories" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if subcategory has accounts
    const accountCount = await prisma.coaAccount.count({
      where: { subCategoryId: id },
    })

    if (accountCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete subcategory with existing accounts" },
        { status: 400 }
      )
    }

    await prisma.coaSubCategory.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Subcategory deleted successfully" })
  } catch (error) {
    console.error("Error deleting COA subcategory:", error)
    return NextResponse.json(
      { error: "Failed to delete COA subcategory" },
      { status: 500 }
    )
  }
}

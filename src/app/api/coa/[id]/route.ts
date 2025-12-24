import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

// GET - Get specific COA by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coa = await prisma.coaCategory.findUnique({
      where: { id: params.id },
      include: {
        subCategories: {
          include: {
            accounts: true
          }
        }
      }
    })

    if (!coa) {
      return NextResponse.json({ error: "COA not found" }, { status: 404 })
    }

    return NextResponse.json(coa)
  } catch (error) {
    console.error("Error fetching COA:", error)
    return NextResponse.json(
      { error: "Failed to fetch COA" },
      { status: 500 }
    )
  }
}

// PUT - Update COA (Super Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can update COA
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can update COA" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, name, type, description, isActive } = body

    const coa = await prisma.coaCategory.update({
      where: { id: params.id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(coa)
  } catch (error) {
    console.error("Error updating COA:", error)
    return NextResponse.json(
      { error: "Failed to update COA" },
      { status: 500 }
    )
  }
}

// DELETE - Delete COA (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can delete COA
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can delete COA" },
        { status: 403 }
      )
    }

    // Check if COA category has subcategories
    const subCategoryCount = await prisma.coaSubCategory.count({
      where: { categoryId: params.id },
    })

    if (subCategoryCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete COA category that has subcategories" },
        { status: 400 }
      )
    }

    await prisma.coaCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "COA deleted successfully" })
  } catch (error) {
    console.error("Error deleting COA:", error)
    return NextResponse.json(
      { error: "Failed to delete COA" },
      { status: 500 }
    )
  }
}

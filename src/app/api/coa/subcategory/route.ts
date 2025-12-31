import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

// POST - Create new COA subcategory
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can create COA subcategory
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { categoryId, code, name, description } = await request.json()

    // Validation
    if (!categoryId || !code || !name) {
      return NextResponse.json(
        { error: "Category ID, code, and name are required" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingSubCategory = await prisma.coaSubCategory.findUnique({
      where: { code }
    })

    if (existingSubCategory) {
      return NextResponse.json(
        { error: "Sub category code already exists" },
        { status: 400 }
      )
    }

    // Create subcategory
    const subCategory = await prisma.coaSubCategory.create({
      data: {
        categoryId,
        code,
        name,
        description: description || null
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(subCategory)
  } catch (error) {
    console.error("Error creating COA subcategory:", error)
    return NextResponse.json(
      { error: "Failed to create COA subcategory" },
      { status: 500 }
    )
  }
}
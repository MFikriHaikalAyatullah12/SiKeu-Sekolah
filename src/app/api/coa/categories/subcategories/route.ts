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

    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can create COA subcategories" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, name, categoryId, description } = body

    if (!code || !name || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const subcategory = await prisma.coaSubCategory.create({
      data: {
        code,
        name,
        categoryId,
        description,
      },
    })

    return NextResponse.json(subcategory, { status: 201 })
  } catch (error) {
    console.error("Error creating COA subcategory:", error)
    return NextResponse.json(
      { error: "Failed to create COA subcategory" },
      { status: 500 }
    )
  }
}

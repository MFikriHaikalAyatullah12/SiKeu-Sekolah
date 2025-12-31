import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get COA categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where: any = { isActive: true }
    
    if (type) {
      // Convert INCOME/EXPENSE to REVENUE/EXPENSE for database
      const coaType = type === "INCOME" ? "REVENUE" : type
      where.type = coaType
    }

    // Get COA categories
    const categories = await prisma.coaCategory.findMany({
      where,
      orderBy: { code: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching COA categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST - Create new COA category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is SUPER_ADMIN
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { code, name, type, description, isActive } = body

    // Validate required fields
    if (!code || !name || !type) {
      return NextResponse.json(
        { error: "Kode, nama, dan tipe kategori harus diisi" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCategory = await prisma.coaCategory.findUnique({
      where: { code },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kode kategori sudah digunakan" },
        { status: 400 }
      )
    }

    // Create new category
    const category = await prisma.coaCategory.create({
      data: {
        code,
        name,
        type,
        description,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating COA category:", error)
    return NextResponse.json(
      { error: "Gagal membuat kategori" },
      { status: 500 }
    )
  }
}

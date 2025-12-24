import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

// GET - List all COA categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get COA categories
    const coaCategories = await prisma.coaCategory.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          include: {
            accounts: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { code: "asc" }
    })

    return NextResponse.json(coaCategories)
  } catch (error) {
    console.error("Error fetching COA:", error)
    return NextResponse.json(
      { error: "Failed to fetch COA" },
      { status: 500 }
    )
  }
}

// POST - Create new COA category (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can create COA
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can create COA" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, name, type, description } = body

    // Validasi
    if (!code || !name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const coa = await prisma.coaCategory.create({
      data: {
        code,
        name,
        type,
        description,
      },
    })

    return NextResponse.json(coa, { status: 201 })
  } catch (error) {
    console.error("Error creating COA:", error)
    return NextResponse.json(
      { error: "Failed to create COA" },
      { status: 500 }
    )
  }
}

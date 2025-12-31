import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

// GET - List all COA data (supports both flat and hierarchical)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "flat" // flat or hierarchy
    const typeFilter = searchParams.get("type")

    if (format === "hierarchy") {
      // For transaction forms - return hierarchical structure
      let whereClause: any = { isActive: true }
      
      if (typeFilter && (typeFilter === "REVENUE" || typeFilter === "EXPENSE")) {
        whereClause.type = typeFilter
      }

      const coaCategories = await prisma.coaCategory.findMany({
        where: whereClause,
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
    } else {
      // For management pages - return flat structure
      let whereClause: any = { isActive: true }
      
      if (typeFilter && (typeFilter === "REVENUE" || typeFilter === "EXPENSE")) {
        whereClause.subCategory = {
          category: {
            type: typeFilter
          }
        }
      }

      // Get all COA accounts with category information
      const coaAccounts = await prisma.coaAccount.findMany({
        where: whereClause,
        include: {
          subCategory: {
            include: {
              category: true
            }
          }
        },
        orderBy: { code: "asc" }
      })

      // Transform to match the expected interface
      const transformedAccounts = coaAccounts.map(account => ({
        id: account.id,
        code: account.code,
        name: account.name,
        category: account.subCategory?.category?.name || "Tidak Berkategori",
        type: account.subCategory?.category?.type === "REVENUE" ? "INCOME" : "EXPENSE",
        accountType: account.subCategory?.name || "Umum",
        description: account.description,
        isActive: account.isActive
      }))

      return NextResponse.json(transformedAccounts)
    }
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

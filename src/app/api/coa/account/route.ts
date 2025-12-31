import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

// POST - Create new COA account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can create COA account
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { subCategoryId, code, name, description, visibleToTreasurer = true } = await request.json()

    // Validation
    if (!subCategoryId || !code || !name) {
      return NextResponse.json(
        { error: "Sub category ID, code, and name are required" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingAccount = await prisma.coaAccount.findUnique({
      where: { code }
    })

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account code already exists" },
        { status: 400 }
      )
    }

    // Create account
    const account = await prisma.coaAccount.create({
      data: {
        subCategoryId,
        code,
        name,
        description: description || null,
        visibleToTreasurer
      },
      include: {
        subCategory: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error creating COA account:", error)
    return NextResponse.json(
      { error: "Failed to create COA account" },
      { status: 500 }
    )
  }
}
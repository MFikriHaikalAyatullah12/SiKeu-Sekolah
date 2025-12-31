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

    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can create COA accounts" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { code, name, subCategoryId, description, visibleToTreasurer } = body

    if (!code || !name || !subCategoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const account = await prisma.coaAccount.create({
      data: {
        code,
        name,
        subCategoryId,
        description,
        visibleToTreasurer: visibleToTreasurer ?? true,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error("Error creating COA account:", error)
    return NextResponse.json(
      { error: "Failed to create COA account" },
      { status: 500 }
    )
  }
}

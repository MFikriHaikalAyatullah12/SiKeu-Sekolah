import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

// GET - Get specific COA account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can view COA account details
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const account = await prisma.coaAccount.findUnique({
      where: { id },

      include: {
        subCategory: {
          include: {
            category: true
          }
        }
      }
    })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error fetching COA account:", error)
    return NextResponse.json(
      { error: "Failed to fetch COA account" },
      { status: 500 }
    )
  }
}

// PUT - Update COA account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can update COA account
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { code, name, description, visibleToTreasurer } = await request.json()
    const { id } = await params

    // Validation
    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      )
    }

    // Check if account exists
    const existingAccount = await prisma.coaAccount.findUnique({
      where: { id }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Check if new code conflicts with other accounts (excluding current)
    if (code !== existingAccount.code) {
      const codeConflict = await prisma.coaAccount.findUnique({
        where: { code }
      })

      if (codeConflict) {
        return NextResponse.json(
          { error: "Account code already exists" },
          { status: 400 }
        )
      }
    }

    // Update account
    const updatedAccount = await prisma.coaAccount.update({
      where: { id },
      data: {
        code,
        name,
        description: description || null,
        visibleToTreasurer: visibleToTreasurer ?? true
      },
      include: {
        subCategory: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error("Error updating COA account:", error)
    return NextResponse.json(
      { error: "Failed to update COA account" },
      { status: 500 }
    )
  }
}

// DELETE - Delete COA account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Super Admin can delete COA account
    if (!(await isSuperAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Check if account exists
    const existingAccount = await prisma.coaAccount.findUnique({
      where: { id }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Check if account is used in transactions
    const transactionCount = await prisma.transaction.count({
      where: { coaAccountId: id }
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete account that is used in transactions" },
        { status: 400 }
      )
    }

    // Delete account
    await prisma.coaAccount.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error) {
    console.error("Error deleting COA account:", error)
    return NextResponse.json(
      { error: "Failed to delete COA account" },
      { status: 500 }
    )
  }
}
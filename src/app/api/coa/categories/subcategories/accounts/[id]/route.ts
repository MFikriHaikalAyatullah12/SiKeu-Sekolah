import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

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

    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can update COA accounts" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { code, name, description, isActive, visibleToTreasurer } = body

    const account = await prisma.coaAccount.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(visibleToTreasurer !== undefined && { visibleToTreasurer }),
      },
    })

    return NextResponse.json(account)
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

    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Only Super Admin can delete COA accounts" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { coaAccountId: id },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete account with existing transactions" },
        { status: 400 }
      )
    }

    await prisma.coaAccount.delete({
      where: { id },
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

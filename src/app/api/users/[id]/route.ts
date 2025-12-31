import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permission - Only Super Admin can edit users
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, email, password, role, schoolId } = body

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate role
    const validRoles = ["SUPER_ADMIN", "BENDAHARA"]
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Valid roles: SUPER_ADMIN, BENDAHARA" },
        { status: 400 }
      )
    }

    // Check if email is being changed and already exists
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role
    }

    // Update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update schoolId if provided
    if (schoolId !== undefined) {
      updateData.schoolProfileId = schoolId
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        schoolProfile: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permission - Only Super Admin can delete users
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        transactions: true,
        accounts: true,
        sessions: true,
        auditLogs: true
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has related data
    if (existingUser.transactions && existingUser.transactions.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete user. User has ${existingUser.transactions.length} transaction(s) associated. Please reassign or delete transactions first.` },
        { status: 400 }
      )
    }

    // Delete user (Cascade will handle accounts, sessions, and audit logs)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("Delete user error:", error)
    
    // Return more specific error message
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Cannot delete user because it has related records. Please remove related data first." },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    )
  }
}

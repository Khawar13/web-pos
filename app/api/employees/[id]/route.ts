// API Route - Individual employee management

import { NextResponse } from "next/server"
import { employeeService } from "@/lib/services"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const success = await employeeService.deleteEmployee(id)

    if (!success) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete employee error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete employee" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updates = await request.json()

    const result = await employeeService.updateEmployee(id, updates)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update employee error:", error)
    return NextResponse.json({ success: false, error: "Failed to update employee" }, { status: 500 })
  }
}

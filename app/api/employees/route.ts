// API Route - Employee management endpoints
// Reengineered from Admin_Interface.java

import { NextResponse } from "next/server"
import { employeeService } from "@/lib/services"

export async function GET() {
  try {
    const employees = await employeeService.getAllEmployees()

    // Remove passwords from response
    const safeEmployees = employees.map(({ password, ...emp }) => emp)

    return NextResponse.json({ success: true, data: safeEmployees })
  } catch (error) {
    console.error("Get employees error:", error)
    return NextResponse.json({ success: false, error: "Failed to get employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, password, role, email } = await request.json()

    if (!firstName || !lastName || !password || !role) {
      return NextResponse.json({ success: false, error: "First name, last name, password, and role required" }, { status: 400 })
    }

    const employee = await employeeService.addEmployee(firstName, lastName, password, role, email)
    const { password: _, ...safeEmployee } = employee

    return NextResponse.json({ success: true, data: safeEmployee })
  } catch (error) {
    console.error("Add employee error:", error)
    return NextResponse.json({ success: false, error: "Failed to add employee" }, { status: 500 })
  }
}

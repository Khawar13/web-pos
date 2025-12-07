// API Route - Customer management endpoints
// Reengineered from Management.java

import { NextResponse } from "next/server"
import { customerService } from "@/lib/services"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")
    const query = searchParams.get("q")

    if (phone) {
      const customer = await customerService.getCustomerByPhone(phone)
      return NextResponse.json({ success: true, data: customer })
    }

    if (query) {
      const customers = await customerService.searchCustomers(query)
      return NextResponse.json({ success: true, data: customers })
    }

    const customers = await customerService.getAllCustomers()
    return NextResponse.json({ success: true, data: customers })
  } catch (error) {
    console.error("Get customers error:", error)
    return NextResponse.json({ success: false, error: "Failed to get customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { phone, name } = await request.json()

    if (!phone || !customerService.validatePhone(phone)) {
      return NextResponse.json({ success: false, error: "Invalid phone number (10 digits required)" }, { status: 400 })
    }

    const exists = await customerService.checkUser(phone)
    if (exists) {
      const customer = await customerService.getCustomerByPhone(phone)
      return NextResponse.json({ success: true, data: customer, existing: true })
    }

    const customer = await customerService.createUser(phone, name)

    if (!customer) {
      return NextResponse.json({ success: false, error: "Failed to create customer" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: customer, existing: false })
  } catch (error) {
    console.error("Create customer error:", error)
    return NextResponse.json({ success: false, error: "Failed to create customer" }, { status: 500 })
  }
}

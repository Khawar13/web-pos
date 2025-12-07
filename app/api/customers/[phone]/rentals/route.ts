// API Route - Customer rentals endpoint

import { NextResponse } from "next/server"
import { customerService } from "@/lib/services"

export async function GET(request: Request, { params }: { params: Promise<{ phone: string }> }) {
  try {
    const { phone } = await params
    const rentals = await customerService.getOutstandingRentals(phone)
    return NextResponse.json({ success: true, data: rentals })
  } catch (error) {
    console.error("Get rentals error:", error)
    return NextResponse.json({ success: false, error: "Failed to get rentals" }, { status: 500 })
  }
}

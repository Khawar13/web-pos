// API Route - Reports Controller

import { type NextRequest, NextResponse } from "next/server"
import { reportService } from "@/lib/services"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (type === "sales" && startDate && endDate) {
      const report = await reportService.generateSalesReport(new Date(startDate), new Date(endDate))
      return NextResponse.json({ success: true, data: report })
    }

    if (type === "inventory") {
      const report = await reportService.generateInventoryReport()
      return NextResponse.json({ success: true, data: report })
    }

    if (type === "dashboard") {
      const stats = await reportService.getDashboardStats()
      return NextResponse.json({ success: true, data: stats })
    }

    return NextResponse.json({ success: false, error: "Invalid report type" }, { status: 400 })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 })
  }
}

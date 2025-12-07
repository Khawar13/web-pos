// API Route - Audit Logs Controller
// Displays login/logout history from legacy system

import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db/mongodb"

export async function GET(request: NextRequest) {
    try {
        const db = await database.connect()

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "100")

        const auditLogs = await db
            .collection("audit_logs")
            .find({})
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray()

        return NextResponse.json({ success: true, data: auditLogs })
    } catch (error) {
        console.error("Error fetching audit logs:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 500 })
    }
}

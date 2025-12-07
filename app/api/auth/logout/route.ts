// API Route - Logout endpoint

import { NextResponse } from "next/server"
import { authService } from "@/lib/services"

export async function POST(request: Request) {
  try {
    const { userId, position } = await request.json()

    await authService.logout(userId, position)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 })
  }
}

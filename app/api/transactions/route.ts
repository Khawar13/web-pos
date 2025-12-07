// API Route - Transactions Controller
// Reengineered to support Sale, Rental, and Return transactions

import { type NextRequest, NextResponse } from "next/server"
import { transactionService } from "@/lib/services"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

    let transactions

    if (startDate && endDate) {
      transactions = await transactionService.getTransactionsByDateRange(new Date(startDate), new Date(endDate))
    } else if (type) {
      transactions = await transactionService.getTransactionsByType(type as any)
    } else {
      transactions = await transactionService.getAllTransactions()
    }

    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, items, paymentMethod, cashierId, customerId, customerPhone, couponCode, isRentalReturn } = body

    let transaction

    switch (type) {
      case "sale":
        transaction = await transactionService.processSale(items, paymentMethod, cashierId, couponCode, customerId)
        break
      case "rental":
        if (!customerPhone) {
          return NextResponse.json({ success: false, error: "Customer phone required for rentals" }, { status: 400 })
        }
        transaction = await transactionService.processRental(items, paymentMethod, cashierId, customerPhone)
        break
      case "return":
        if (!customerPhone) {
          return NextResponse.json({ success: false, error: "Customer phone required for returns" }, { status: 400 })
        }
        transaction = await transactionService.processReturn(
          items,
          paymentMethod,
          cashierId,
          customerPhone,
          isRentalReturn ?? false,
        )
        break
      default:
        // Default to sale for backward compatibility
        transaction = await transactionService.processSale(items, paymentMethod, cashierId, couponCode, customerId)
    }

    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    console.error("Error processing transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to process transaction" }, { status: 500 })
  }
}

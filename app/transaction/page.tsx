// Transaction Interface Page
// Reengineered from Transaction_Interface.java
// Handles Sale, Rental, and Return operations

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Minus, Trash2, CreditCard, Banknote, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import type { Product, PaymentMethod, User, TransactionType } from "@/lib/types/models"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
  discount: number
  transactionType: TransactionType
  daysLate?: number
}

export default function TransactionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionType = (searchParams.get("type") as TransactionType) || "sale"

  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerPhone, setCustomerPhone] = useState("")
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showReturnTypeDialog, setShowReturnTypeDialog] = useState(false)
  const [returnType, setReturnType] = useState<"rental" | "unsatisfactory">("rental")
  const [itemId, setItemId] = useState("")
  const [itemQuantity, setItemQuantity] = useState("1")
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [cashAmount, setCashAmount] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [change, setChange] = useState(0)
  const [outstandingRentals, setOutstandingRentals] = useState<any[]>([])

  const { data: productsData } = useSWR("/api/products", fetcher)
  const allProducts: Product[] = productsData?.data || []

  // Filter products based on transaction type
  const products = allProducts.filter((p) => {
    if (transactionType === "rental") {
      return p.isRentable === true
    } else if (transactionType === "sale") {
      return p.isRentable === false
    }
    return true // For returns, show all
  })

  const TAX_RATE = 0.06 // 6% tax
  const COUPON_DISCOUNT = 0.1 // 10% coupon discount

  useEffect(() => {
    const savedUser = localStorage.getItem("pos_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(savedUser))

    // Show phone dialog for rental and return
    if (transactionType === "rental") {
      setShowPhoneDialog(true)
    } else if (transactionType === "return") {
      setShowReturnTypeDialog(true)
    }
  }, [router, transactionType])

  const handlePhoneSubmit = async () => {
    if (!customerPhone || customerPhone.length !== 10) {
      alert("Invalid phone number. Please enter a 10-digit number.")
      return
    }

    // Check/create customer
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: customerPhone }),
    })
    const data = await response.json()

    if (data.success) {
      if (!data.existing) {
        alert("New customer was registered")
      }

      // For rental returns, fetch outstanding rentals
      if (transactionType === "return" && returnType === "rental") {
        const rentalsRes = await fetch(`/api/customers/${customerPhone}/rentals`)
        const rentalsData = await rentalsRes.json()
        if (rentalsData.success && rentalsData.data.length > 0) {
          setOutstandingRentals(rentalsData.data)
        } else {
          alert("No outstanding rentals found for this customer")
          router.push("/cashier")
          return
        }
      }

      setShowPhoneDialog(false)
    } else {
      alert("Failed to process customer")
    }
  }

  const handleReturnTypeSelect = (type: "rental" | "unsatisfactory") => {
    setReturnType(type)
    setShowReturnTypeDialog(false)
    // Show phone dialog for both return types - API requires customer phone for all returns
    setShowPhoneDialog(true)
  }

  const handleAddItem = () => {
    const id = itemId.trim()
    const qty = Number.parseInt(itemQuantity)

    if (!id || isNaN(qty) || qty <= 0) {
      alert("Invalid item ID or quantity")
      return
    }

    // For rental returns, check if item is in outstanding rentals
    if (transactionType === "return" && returnType === "rental") {
      const rental = outstandingRentals.find(
        (r) => r.productId === id || r.productId === `PRD-R${id}` || r.productId.includes(id),
      )
      if (!rental) {
        alert("Item not found in outstanding rentals for this customer")
        return
      }

      const existingIndex = cart.findIndex((item) => item.product.productId === rental.productId)
      if (existingIndex >= 0) {
        const updated = [...cart]
        updated[existingIndex].quantity += qty
        updated[existingIndex].subtotal = updated[existingIndex].quantity * rental.lateFeePerDay * rental.daysLate
        setCart(updated)
      } else {
        const lateFee = rental.lateFeePerDay * rental.daysLate
        setCart([
          ...cart,
          {
            product: {
              productId: rental.productId,
              name: rental.productName,
              price: lateFee,
              quantity: rental.quantity,
            } as Product,
            quantity: qty,
            subtotal: lateFee * qty,
            discount: 0,
            transactionType: "return",
            daysLate: rental.daysLate,
          },
        ])
      }
    } else {
      // Regular sale or rental - search by various ID formats
      const product = products.find(
        (p) =>
          p.productId === id ||
          p.productId === `PRD-S${id}` ||
          p.productId === `PRD-R${id}` ||
          p.barcode === id ||
          p.legacyId === id,
      )

      if (!product) {
        alert(`Item "${id}" not found in ${transactionType === "rental" ? "rental" : "sale"} inventory`)
        return
      }

      if (product.quantity < qty) {
        alert(`Insufficient stock. Available: ${product.quantity}`)
        return
      }

      const existingIndex = cart.findIndex((item) => item.product.productId === product.productId)
      if (existingIndex >= 0) {
        const newQty = cart[existingIndex].quantity + qty
        if (newQty > product.quantity) {
          alert(`Cannot add more. Stock available: ${product.quantity}`)
          return
        }
        const updated = [...cart]
        const price =
          transactionType === "rental" && product.rentalPricePerDay ? product.rentalPricePerDay : product.price
        updated[existingIndex].quantity = newQty
        updated[existingIndex].subtotal = newQty * price
        setCart(updated)
      } else {
        const price =
          transactionType === "rental" && product.rentalPricePerDay ? product.rentalPricePerDay : product.price
        setCart([
          ...cart,
          {
            product,
            quantity: qty,
            subtotal: qty * price,
            discount: 0,
            transactionType,
          },
        ])
      }
    }

    setItemId("")
    setItemQuantity("1")
    setShowAddItemDialog(false)
  }

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter((item) => item.product.productId !== productId))
  }

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId)
      return
    }
    setCart(
      cart.map((item) => {
        if (item.product.productId !== productId) return item
        const price =
          transactionType === "rental" && item.product.rentalPricePerDay
            ? item.product.rentalPricePerDay
            : item.product.price
        return { ...item, quantity: newQty, subtotal: newQty * price }
      }),
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const discount = couponApplied ? subtotal * COUPON_DISCOUNT : 0
  const taxableAmount = subtotal - discount
  const tax = transactionType === "return" ? 0 : taxableAmount * TAX_RATE
  const total = taxableAmount + tax

  const handleEndTransaction = () => {
    if (cart.length === 0) {
      alert("Cart is currently empty. Please add items before ending transaction")
      return
    }

    if (transactionType === "sale" && !couponApplied) {
      const coupon = prompt("Enter coupon code if customer has one (e.g., C001-C200), or leave blank:")
      if (coupon && coupon.trim()) {
        // Validate coupon format (C001 to C200)
        const match = coupon
          .trim()
          .toUpperCase()
          .match(/^C(\d{3})$/)
        if (match) {
          const num = Number.parseInt(match[1])
          if (num >= 1 && num <= 200) {
            setCouponCode(coupon.trim().toUpperCase())
            setCouponApplied(true)
            alert(`Coupon ${coupon.toUpperCase()} applied! 10% discount.`)
          } else {
            alert("Invalid coupon code")
          }
        } else {
          alert("Invalid coupon format. Use C001-C200")
        }
      }
    }

    // For refunds (unsatisfactory returns), process immediately without payment dialog
    const isRefund = transactionType === "return" && returnType === "unsatisfactory"

    if (isRefund) {
      // Alert cashier about refund amount
      alert(`REFUND: Give $${total.toFixed(2)} back to customer`)
      // Set payment method to cash for refunds
      setPaymentMethod("cash")
      // Process the refund immediately
      setTimeout(() => handlePayment(), 100) // Small delay to ensure state is set
    } else {
      // For normal transactions, show payment dialog
      setShowPaymentDialog(true)
    }
  }

  const handlePayment = async () => {
    const isRefund = transactionType === "return" && returnType === "unsatisfactory"

    if (paymentMethod === "cash") {
      // For refunds (unsatisfactory returns), customer is owed money
      if (isRefund) {
        // Refund scenario - customer gets money back
        setChange(total) // Total amount is the refund
      } else {
        // Normal payment scenario - customer pays
        const cash = Number.parseFloat(cashAmount)
        if (isNaN(cash) || cash < total) {
          alert("Value must be greater than or equal to total value")
          return
        }
        setChange(cash - total)
      }
    }

    if (paymentMethod === "card") {
      if (cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber)) {
        alert("Invalid credit card number. Must be 16 digits.")
        return
      }
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: transactionType,
          items:
            transactionType === "return" && returnType === "rental"
              ? cart.map((item) => ({
                productId: item.product.productId,
                productName: item.product.name,
                quantity: item.quantity,
                daysLate: item.daysLate || 0,
                originalPrice: item.product.price,
              }))
              : cart,
          paymentMethod,
          cashierId: user?.userId || "CASHIER-001",
          customerPhone: customerPhone || undefined,
          couponCode: couponApplied ? couponCode : undefined,
          isRentalReturn: transactionType === "return" && returnType === "rental",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionId(data.data.transactionId)
        setIsComplete(true)
      } else {
        alert("Transaction failed. Please try again.")
      }
    } catch {
      alert("An error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    alert("Transaction Has Been Cancelled")
    router.push("/cashier")
  }

  const handleComplete = () => {
    router.push("/cashier")
  }

  const getTitle = () => {
    switch (transactionType) {
      case "sale":
        return "Sale"
      case "rental":
        return "Rental"
      case "return":
        return returnType === "rental" ? "Return - Rented Items" : "Return - Unsatisfactory Items"
      default:
        return "Transaction"
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Payment Successful</h2>
            <p className="text-muted-foreground mb-2">Transaction ID: {transactionId}</p>
            <p className="text-2xl font-bold mb-4">${total.toFixed(2)}</p>
            {change > 0 && <p className="text-lg text-muted-foreground mb-4">Change: ${change.toFixed(2)}</p>}
            {transactionType === "rental" && (
              <p className="text-sm text-muted-foreground mb-4">
                Return Date: {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            )}
            <Button onClick={handleComplete} className="w-full">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/cashier")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">SG Technologies</h1>
              <p className="text-sm text-muted-foreground">Transaction View - {getTitle()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {customerPhone && (
              <Badge variant="outline" className="text-sm">
                Customer: {customerPhone}
              </Badge>
            )}
            {couponApplied && (
              <Badge variant="default" className="text-sm bg-green-600">
                Coupon: {couponCode} (10% off)
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cart Display */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Cart Items</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {transactionType === "rental"
                      ? "Rental Items"
                      : transactionType === "sale"
                        ? "Sale Items"
                        : "Return Items"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-400px)]">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Cart is empty. Add items to begin.</p>
                      <p className="text-sm mt-2">
                        {transactionType === "sale" && "Enter item ID (e.g., 1000, 1001, 1002...)"}
                        {transactionType === "rental" && "Enter rental ID (e.g., 1000, 1001, 1002...)"}
                        {transactionType === "return" &&
                          returnType === "rental" &&
                          "Enter the rental item ID to return"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.product.productId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              $
                              {(transactionType === "rental" && item.product.rentalPricePerDay
                                ? item.product.rentalPricePerDay
                                : item.product.price
                              ).toFixed(2)}
                              {transactionType === "rental" ? "/day" : " each"}
                              {item.daysLate !== undefined && item.daysLate > 0 && ` - ${item.daysLate} days late`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.product.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.product.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-medium w-20 text-right">${item.subtotal.toFixed(2)}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleRemoveItem(item.product.productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Totals */}
                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount (10%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  {transactionType !== "return" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (6%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full h-16" onClick={() => setShowAddItemDialog(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Item
            </Button>
            <Button className="w-full h-16 bg-transparent" variant="outline" onClick={() => setShowAddItemDialog(true)}>
              <Minus className="h-5 w-5 mr-2" />
              Remove Item
            </Button>
            <Button className="w-full h-16" variant="default" onClick={handleEndTransaction}>
              End
            </Button>
            <Button className="w-full h-16" variant="destructive" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Phone Number Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={() => { }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Phone Number</DialogTitle>
            <DialogDescription>Please enter the customer&apos;s 10-digit phone number</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="1234567890"
              maxLength={10}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push("/cashier")}>
              Cancel
            </Button>
            <Button onClick={handlePhoneSubmit}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Type Dialog */}
      <Dialog open={showReturnTypeDialog} onOpenChange={() => { }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Type</DialogTitle>
            <DialogDescription>Returning rented items or unsatisfactory items?</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Button className="w-full" onClick={() => handleReturnTypeSelect("rental")}>
              Rented Items (with late fee calculation)
            </Button>
            <Button
              className="w-full bg-transparent"
              variant="outline"
              onClick={() => handleReturnTypeSelect("unsatisfactory")}
            >
              Unsatisfactory Items (refund)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Item</DialogTitle>
            <DialogDescription>
              {transactionType === "sale" && "Enter sale item ID (e.g., 1000 for Potato, 1002 for SkirtSteak)"}
              {transactionType === "rental" && "Enter rental item ID (e.g., 1000 for TheoryOfEverything)"}
              {transactionType === "return" && "Enter item ID to return"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="itemId">Item ID</Label>
              <Input
                id="itemId"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder={transactionType === "rental" ? "e.g., 1000" : "e.g., 1000"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Amount</Label>
              <Input
                id="quantity"
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Exit
            </Button>
            <Button onClick={handleAddItem}>Enter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{total < 0 ? "Refund" : "Payment"}</DialogTitle>
            <DialogDescription>
              {total < 0
                ? `Refund amount: $${Math.abs(total).toFixed(2)}`
                : `Total amount: $${total.toFixed(2)}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Cash
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Credit Card
                </Label>
              </div>
            </RadioGroup>

            {/* Only show cash amount input if NOT a refund */}
            {paymentMethod === "cash" && total >= 0 && (
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Cash Amount</Label>
                <Input
                  id="cashAmount"
                  type="number"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Enter amount received"
                />
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number (16 digits)</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="1234567890123456"
                  maxLength={16}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

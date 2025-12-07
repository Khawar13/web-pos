// Presentation Layer - Checkout Dialog Component

"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/lib/hooks/use-cart"
import type { PaymentMethod } from "@/lib/types/models"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Smartphone, Receipt, Loader2, CheckCircle } from "lucide-react"

interface CheckoutDialogProps {
  open: boolean
  onClose: () => void
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "cash", label: "Cash", icon: <Banknote className="h-5 w-5" /> },
  { value: "card", label: "Credit/Debit Card", icon: <CreditCard className="h-5 w-5" /> },
  { value: "mobile", label: "Mobile Payment", icon: <Smartphone className="h-5 w-5" /> },
]

export function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const { items, subtotal, tax, total, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const handleCheckout = async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          paymentMethod,
          cashierId: "CASHIER-001", // In real app, get from auth context
          discount: 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionId(data.data.transactionId)
        setIsComplete(true)
        clearCart()
      } else {
        alert("Transaction failed. Please try again.")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setIsComplete(false)
    setTransactionId(null)
    onClose()
  }

  if (isComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Payment Successful</h2>
            <p className="text-muted-foreground mb-4">Transaction ID: {transactionId}</p>
            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
          </div>
          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              <Receipt className="h-4 w-4 mr-2" />
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items ({items.length})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              {paymentMethods.map((method) => (
                <div
                  key={method.value}
                  className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                >
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Label htmlFor={method.value} className="flex items-center gap-2 cursor-pointer flex-1">
                    {method.icon}
                    {method.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleCheckout} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay ${total.toFixed(2)}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

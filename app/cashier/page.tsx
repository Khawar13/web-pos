// Cashier Interface Page
// Reengineered from Cashier_Interface.java

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, RotateCcw, LogOut, User } from "lucide-react"
import type { User as UserType } from "@/lib/types/models"

export default function CashierPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem("pos_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(savedUser))
  }, [router])

  const handleLogout = async () => {
    if (user) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, position: "Cashier" }),
      })
    }
    localStorage.removeItem("pos_user")
    router.push("/login")
  }

  const handleTransaction = (type: string) => {
    router.push(`/transaction?type=${type}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SG Technologies</h1>
            <p className="text-sm text-muted-foreground">Cashier View</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>{user?.name || "Cashier"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => handleTransaction("sale")}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                Sale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Process a new sale transaction</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleTransaction("rental")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                Rental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Process a new rental transaction</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleTransaction("return")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-amber-500" />
                </div>
                Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Process returns for rented or unsatisfactory items</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleLogout}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-destructive" />
                </div>
                Log Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Sign out of the system</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

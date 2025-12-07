// Landing Page - Entry point to the POS system

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Store, LogIn, ShieldCheck, ShoppingCart, Package, RotateCcw } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
            <Store className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">SG Technologies</h1>
          <p className="text-xl text-muted-foreground mb-8">Point of Sale System</p>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            A modern, web-based POS system reengineered from Java Swing to Next.js with MongoDB Atlas. Features include
            sales processing, rental management, returns handling, and employee administration.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2">
              <LogIn className="h-5 w-5" />
              Login to System
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">System Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Sales Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Process sales transactions with support for multiple payment methods, coupon codes, and tax
                calculations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Rental Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Handle item rentals with customer tracking, due dates, and automatic late fee calculations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-2">
                <RotateCcw className="h-6 w-6 text-amber-500" />
              </div>
              <CardTitle>Returns Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Process returns for both rental items with late fees and unsatisfactory purchase returns.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-2">
                <ShieldCheck className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage employees with role-based access control. Add, update, or remove cashiers and administrators.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-center mb-8">Improved Architecture</h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid gap-4">
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Presentation Layer</h3>
                <p className="text-sm text-muted-foreground">
                  React components with Next.js App Router, Tailwind CSS, and shadcn/ui
                </p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Business Logic Layer</h3>
                <p className="text-sm text-muted-foreground">
                  Service classes for transactions, authentication, employees, and customers
                </p>
              </div>
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">Data Access Layer</h3>
                <p className="text-sm text-muted-foreground">
                  Repository pattern with MongoDB Atlas for products, users, and transactions
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-card rounded-lg border">
              <h3 className="font-semibold mb-2">Design Patterns Used</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary/10 rounded text-sm">MVC</span>
                <span className="px-2 py-1 bg-primary/10 rounded text-sm">Repository</span>
                <span className="px-2 py-1 bg-primary/10 rounded text-sm">Singleton</span>
                <span className="px-2 py-1 bg-primary/10 rounded text-sm">Observer</span>
                <span className="px-2 py-1 bg-primary/10 rounded text-sm">Factory</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SG Technologies POS System - Reengineered with Next.js & MongoDB</p>
          <p className="mt-2">Software Reverse Engineering Assignment</p>
        </div>
      </footer>
    </div>
  )
}

// Admin Interface Page
// Reengineered from Admin_Interface.java

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, UserMinus, UserCog, Monitor, LogOut, User, Loader2 } from "lucide-react"
import type { User as UserType } from "@/lib/types/models"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [addingCashier, setAddingCashier] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [newName, setNewName] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [updateUsername, setUpdateUsername] = useState("")
  const [updateName, setUpdateName] = useState("")
  const [updatePassword, setUpdatePassword] = useState("")
  const [updatePosition, setUpdatePosition] = useState("")

  const { data: employeesData, isLoading } = useSWR("/api/employees", fetcher)
  const employees = employeesData?.data || []

  useEffect(() => {
    const savedUser = localStorage.getItem("pos_user")
    if (!savedUser) {
      router.push("/login")
      return
    }
    const parsed = JSON.parse(savedUser)
    if (parsed.role !== "admin" && parsed.role !== "manager") {
      router.push("/cashier")
      return
    }
    setUser(parsed)
  }, [router])

  const handleLogout = async () => {
    if (user) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, position: "Admin" }),
      })
    }
    localStorage.removeItem("pos_user")
    router.push("/login")
  }

  const handleAddEmployee = async () => {
    setIsSubmitting(true)
    try {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          password: newPassword,
          role: addingCashier ? "cashier" : "admin",
        }),
      })
      mutate("/api/employees")
      setShowAddDialog(false)
      setNewName("")
      setNewPassword("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveEmployee = async (userId: string) => {
    if (confirm("Are you sure you want to remove this employee?")) {
      await fetch(`/api/employees/${userId}`, { method: "DELETE" })
      mutate("/api/employees")
    }
  }

  const handleUpdateEmployee = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/employees/${updateUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: updatePassword || undefined,
          position: updatePosition || undefined,
          name: updateName || undefined,
        }),
      })
      const data = await response.json()
      if (!data.success) {
        alert(data.error)
      } else {
        mutate("/api/employees")
        setShowUpdateDialog(false)
        resetUpdateForm()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetUpdateForm = () => {
    setUpdateUsername("")
    setUpdateName("")
    setUpdatePassword("")
    setUpdatePosition("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SG Technologies</h1>
            <p className="text-sm text-muted-foreground">Administrator View</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>{user?.name || "Admin"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map((emp: any) => (
                          <TableRow key={emp.userId}>
                            <TableCell className="font-mono">{emp.username}</TableCell>
                            <TableCell>
                              <Badge variant={emp.role === "admin" ? "default" : "secondary"}>{emp.role}</Badge>
                            </TableCell>
                            <TableCell>{emp.name}</TableCell>
                            <TableCell>
                              <Badge variant={emp.isActive ? "default" : "destructive"}>
                                {emp.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleRemoveEmployee(emp.userId)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => {
                setAddingCashier(true)
                setShowAddDialog(true)
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Cashier
            </Button>
            <Button
              className="w-full justify-start"
              onClick={() => {
                setAddingCashier(false)
                setShowAddDialog(true)
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => setShowUpdateDialog(true)}
            >
              <UserCog className="h-4 w-4 mr-2" />
              Update Employee
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => router.push("/cashier")}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Cashier View
            </Button>
            <Button className="w-full justify-start" variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register {addingCashier ? "Cashier" : "Admin"}</DialogTitle>
            <DialogDescription>Add a new employee to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} disabled={isSubmitting || !newName || !newPassword}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Employee Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Employee Info</DialogTitle>
            <DialogDescription>Update employee details (leave blank to keep unchanged)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-username">Username</Label>
              <Input
                id="update-username"
                value={updateUsername}
                onChange={(e) => setUpdateUsername(e.target.value)}
                placeholder="Employee username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-name">Name</Label>
              <Input
                id="update-name"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                placeholder="New name (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-password">Password</Label>
              <Input
                id="update-password"
                type="password"
                value={updatePassword}
                onChange={(e) => setUpdatePassword(e.target.value)}
                placeholder="New password (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-position">Position</Label>
              <Select value={updatePosition} onValueChange={setUpdatePosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateDialog(false)
                resetUpdateForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} disabled={isSubmitting || !updateUsername}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

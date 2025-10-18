"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { mockClients, mockCouriers } from "@/lib/mock-data"
import type { TaskType } from "@/lib/types"

export default function NewTaskPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "delivery" as TaskType,
    clientId: "",
    referenceBL: "",
    mbl: "",
    hbl: "",
    freightCertificate: "",
    foCertificate: "",
    bunkerCertificate: "",
    scheduledDate: "",
    courierId: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("[v0] New task created:", formData)
      router.push("/dashboard")
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            ← Back
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">New Task</h1>
          <p className="text-sm text-muted-foreground">Create a new delivery or pickup task</p>
        </div>
      </div>

      <Card className="border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg font-medium">Task Details</CardTitle>
          <CardDescription className="text-sm">Fill in the information for the new task</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Task Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="both">Both (Pickup & Delivery)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
                  <SelectTrigger id="clientId">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceBL">Reference BL *</Label>
                <Input
                  id="referenceBL"
                  placeholder="BL-2024-001"
                  value={formData.referenceBL}
                  onChange={(e) => handleChange("referenceBL", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mbl">MBL</Label>
                <Input
                  id="mbl"
                  placeholder="MBL-001"
                  value={formData.mbl}
                  onChange={(e) => handleChange("mbl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hbl">HBL</Label>
                <Input
                  id="hbl"
                  placeholder="HBL-001"
                  value={formData.hbl}
                  onChange={(e) => handleChange("hbl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="freightCertificate">Freight Certificate</Label>
                <Input
                  id="freightCertificate"
                  placeholder="FC-001"
                  value={formData.freightCertificate}
                  onChange={(e) => handleChange("freightCertificate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foCertificate">FO Certificate</Label>
                <Input
                  id="foCertificate"
                  placeholder="FO-001"
                  value={formData.foCertificate}
                  onChange={(e) => handleChange("foCertificate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bunkerCertificate">Bunker Certificate</Label>
                <Input
                  id="bunkerCertificate"
                  placeholder="BK-001"
                  value={formData.bunkerCertificate}
                  onChange={(e) => handleChange("bunkerCertificate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleChange("scheduledDate", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courierId">Assign Courier</Label>
                <Select value={formData.courierId} onValueChange={(value) => handleChange("courierId", value)}>
                  <SelectTrigger id="courierId">
                    <SelectValue placeholder="Select a courier" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCouriers.map((courier) => (
                      <SelectItem key={courier.id} value={courier.id}>
                        {courier.name} ({courier.activeTasks} active tasks)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="shadow-lg shadow-primary/25">
                {isLoading ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

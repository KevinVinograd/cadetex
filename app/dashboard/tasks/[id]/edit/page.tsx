"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { mockClients, mockCouriers, mockTasks } from "@/lib/mock-data"
import type { TaskType } from "@/lib/types"

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = React.use(params)
  const task = mockTasks.find((t) => t.id === id)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: task?.type || ("delivery" as TaskType),
    clientName: task?.clientName || "",
    referenceBL: task?.referenceBL || "",
    mbl: task?.mbl || "",
    hbl: task?.hbl || "",
    freightCertificate: "",
    foCertificate: "",
    bunkerCertificate: "",
    scheduledDate: task?.scheduledDate || "",
    courierName: task?.courierName || "",
    notes: "",
  })

  if (!task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Not Found</h1>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("[v0] Task updated:", formData)
      router.push(`/dashboard/tasks/${id}`)
    }, 1000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/tasks/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Edit Task</h1>
          <p className="text-muted-foreground text-pretty">Update task information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Update the information for this task</CardDescription>
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
                <Label htmlFor="clientName">Client *</Label>
                <Select value={formData.clientName} onValueChange={(value) => handleChange("clientName", value)}>
                  <SelectTrigger id="clientName">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
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
                <Label htmlFor="courierName">Assign Courier</Label>
                <Select value={formData.courierName} onValueChange={(value) => handleChange("courierName", value)}>
                  <SelectTrigger id="courierName">
                    <SelectValue placeholder="Select a courier" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCouriers.map((courier) => (
                      <SelectItem key={courier.id} value={courier.name}>
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
              <Link href={`/dashboard/tasks/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

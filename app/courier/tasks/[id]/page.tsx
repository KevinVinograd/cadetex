"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, FileText, Camera, CheckCircle2, Upload } from "lucide-react"
import Link from "next/link"
import { mockTasks } from "@/lib/mock-data"
import type { TaskStatus } from "@/lib/types"

export default function CourierTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = React.use(params)
  const task = mockTasks.find((t) => t.id === id)
  const [photoPreview, setPhotoPreview] = useState<string | null>(task?.photoUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/courier">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold tracking-tight">Task Not Found</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCompleteTask = () => {
    setIsUploading(true)
    // Simulate upload
    setTimeout(() => {
      console.log("[v0] Task completed with photo")
      setIsUploading(false)
      router.push("/courier")
    }, 1500)
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      pickup: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      both: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    }
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>
  }

  const getStatusBadge = (status: TaskStatus) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return <Badge className={variants[status]}>{status}</Badge>
  }

  const isCompleted = task.status === "completed"

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/courier">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-balance">Task Details</h1>
              <p className="text-muted-foreground text-pretty">{task.referenceBL}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Task Information</CardTitle>
                    <CardDescription>Details about this {task.type} task</CardDescription>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Task Type</p>
                    <div>{getTypeBadge(task.type)}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                    <p className="text-sm font-medium">{new Date(task.scheduledDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">Client</p>
                      <p className="text-sm text-muted-foreground">{task.clientName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">Reference BL</p>
                      <p className="text-sm text-muted-foreground">{task.referenceBL}</p>
                    </div>
                  </div>

                  {task.mbl && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">MBL</p>
                        <p className="text-sm text-muted-foreground">{task.mbl}</p>
                      </div>
                    </div>
                  )}

                  {task.hbl && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">HBL</p>
                        <p className="text-sm text-muted-foreground">{task.hbl}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {!isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Upload Delivery Photo
                  </CardTitle>
                  <CardDescription>Take a photo of the delivery receipt or confirmation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {photoPreview ? (
                    <div className="space-y-4">
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Delivery photo"
                        className="w-full rounded-lg border"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                          <Upload className="mr-2 h-4 w-4" />
                          Change Photo
                        </Button>
                        <Button onClick={handleCompleteTask} disabled={isUploading} className="flex-1">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {isUploading ? "Completing..." : "Complete Task"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full" size="lg">
                      <Camera className="mr-2 h-5 w-5" />
                      Take Photo
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm font-medium">Created</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">{new Date(task.createdAt).toLocaleString()}</p>
                </div>
                {task.status === "completed" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-sm font-medium">Completed</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">
                      {new Date(task.scheduledDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {isCompleted && task.photoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Delivery Photo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={task.photoUrl || "/placeholder.svg"}
                    alt="Delivery receipt"
                    className="w-full rounded-lg border"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

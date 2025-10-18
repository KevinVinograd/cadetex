import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"

export default function TasksPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground">Manage all delivery and pickup tasks</p>
      </div>

      <Card className="border">
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>View and manage all tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Task management implementation coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}


import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { mockOrganizations } from "../lib/mock-data"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Package, Sparkles } from "lucide-react"
import { ThemeToggle } from "../components/theme-toggle"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login - in production, this would call an API
    setTimeout(() => {
      // Check org-admins from stored orgs first
      const stored = localStorage.getItem("orgs")
      const orgs = stored ? JSON.parse(stored) : mockOrganizations
      const isOrgAdmin = orgs.some((o: { adminEmail?: string }) => o.adminEmail?.toLowerCase() === email.toLowerCase())

      // Initialize organizations if not already stored
      if (!stored) {
        localStorage.setItem("orgs", JSON.stringify(orgs))
      }

      if (isOrgAdmin) {
        localStorage.setItem("userRole", "orgadmin")
        localStorage.setItem("userName", email)
        localStorage.setItem("userEmail", email)
        navigate("/dashboard")
      } else if (email.includes("superadmin")) {
        localStorage.setItem("userRole", "superadmin")
        localStorage.setItem("userName", "Super Admin")
        localStorage.setItem("userEmail", email)
        navigate("/superadmin")
      } else if (email.includes("admin")) {
        localStorage.setItem("userRole", "orgadmin")
        localStorage.setItem("userName", "Admin User")
        localStorage.setItem("userEmail", email)
        navigate("/dashboard")
      } else {
        localStorage.setItem("userRole", "courier")
        localStorage.setItem("userName", "Courier User")
        localStorage.setItem("userEmail", email)
        localStorage.setItem("courierId", "courier-1") // Assign courier ID for demo
        navigate("/courier")
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/95 shadow-2xl border-2">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1" />
            <div className="flex justify-center flex-1">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                <Package className="w-10 h-10 text-primary-foreground" />
                <Sparkles className="w-4 h-4 text-primary-foreground absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Courier Management
            </CardTitle>
            <CardDescription className="text-pretty mt-2 text-base">
              Sign in to manage your delivery operations
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-xs text-muted-foreground text-center text-pretty pt-2">
              Demo: Use email with &quot;admin&quot; for admin access, or any other email for courier access
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


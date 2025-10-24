import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Package, Sparkles } from "lucide-react"
import { ThemeToggle } from "../components/theme-toggle"
import { useAuth } from "../hooks/use-auth"
import { Alert, AlertDescription } from "../components/ui/alert"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await login(email, password)
      
      // Navigate based on role from the response
      const userRole = response.user.role?.toLowerCase()
      if (userRole === 'superadmin') {
        navigate("/superadmin")
      } else if (userRole === 'courier') {
        navigate("/courier")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Correo electrónico o contraseña inválidos. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
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
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <p className="text-xs text-muted-foreground text-center text-pretty pt-2">
              Enter your credentials to access the system
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


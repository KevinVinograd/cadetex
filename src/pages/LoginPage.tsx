import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Package, Sparkles } from "lucide-react"
import { ThemeToggle } from "../components/theme-toggle"
import { useAuth } from "../hooks/use-auth"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Checkbox } from "../components/ui/checkbox"
import { getTranslation } from "../lib/translations"

const t = getTranslation()

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, role, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Cargar email y contraseña guardados al montar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
      if (savedPassword) {
        setPassword(savedPassword)
      }
    }
  }, [])

  // Verificar si ya hay una sesión activa y redirigir
  useEffect(() => {
    if (!authLoading && role) {
      // Hay una sesión activa, redirigir según el rol
      if (role === 'superadmin') {
        navigate("/superadmin", { replace: true })
      } else if (role === 'courier') {
        navigate("/courier", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    }
  }, [role, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await login(email, password)
      
      // Guardar email y contraseña si se seleccionó recordar
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
        localStorage.setItem('rememberedPassword', password)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
      }
      
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
      setError(t.login.error)
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
              {t.login.title}
            </CardTitle>
            <CardDescription className="text-pretty mt-2 text-base">
              {t.login.description}
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
                {t.login.email}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t.login.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t.login.password}
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => {
                  setRememberMe(checked === true)
                  if (checked === false) {
                    // Si se desmarca, eliminar los datos guardados
                    localStorage.removeItem('rememberedEmail')
                    localStorage.removeItem('rememberedPassword')
                  }
                }}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                {t.login.rememberMe}
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? t.login.signingIn : t.login.signIn}
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


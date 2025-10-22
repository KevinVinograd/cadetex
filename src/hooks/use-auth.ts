
import { useEffect, useState } from "react"
import { apiService, User } from "@/lib/api"

export type AuthState = {
  role: "superadmin" | "orgadmin" | "courier" | null
  email: string | null
  organizationId: string | null
  isLoading: boolean
  user: User | null
}

export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<{ user: User }>
  logout: () => void
} {
  const [state, setState] = useState<AuthState>({ 
    role: null, 
    email: null, 
    organizationId: null, 
    isLoading: true,
    user: null
  })

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const role = localStorage.getItem('userRole') as AuthState["role"]
        const email = localStorage.getItem('userEmail')
        
        console.log("useAuth - initializeAuth - token:", !!token, "role:", role, "email:", email)
        
        if (token && role && email) {
          // Verificar que el token sigue siendo válido
          const validation = await apiService.validateToken()
          console.log("useAuth - validation result:", validation)
          
          if (validation.valid && validation.user) {
            console.log("useAuth - setting state with user:", validation.user)
            setState({
              role: validation.user.role?.toLowerCase() as AuthState["role"],
              email: validation.user.email,
              organizationId: validation.user.organizationId,
              isLoading: false,
              user: validation.user
            })
          } else {
            // Token inválido, limpiar todo
            console.log("useAuth - token invalid, clearing state")
            apiService.logout()
            localStorage.removeItem('userRole')
            localStorage.removeItem('userEmail')
            localStorage.removeItem('userName')
            setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
          }
        } else {
          console.log("useAuth - no token/role/email, setting empty state")
          setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
        }
      } catch (error) {
        console.error("useAuth Error:", error)
        apiService.logout()
        localStorage.removeItem('userRole')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password })
      const role = response.user.role?.toLowerCase() as AuthState["role"]
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('userRole', role)
      localStorage.setItem('userEmail', response.user.email)
      localStorage.setItem('userName', response.user.name)
      
      setState({
        role: role,
        email: response.user.email,
        organizationId: response.user.organizationId,
        isLoading: false,
        user: response.user
      })
      
      return { user: response.user }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    apiService.logout()
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
  }

  return {
    ...state,
    login,
    logout
  }
}

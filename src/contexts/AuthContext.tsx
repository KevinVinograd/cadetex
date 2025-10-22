import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react"
import { apiService, User } from "@/lib/api"

export type AuthState = {
    isLoading: boolean
    role: "superadmin" | "orgadmin" | "courier" | null
    email: string | null
    organizationId: string | null
    user: User | null
}

type AuthContextType = AuthState & {
    login: (email: string, password: string) => Promise<{ user: User }>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        role: null,
        email: null,
        organizationId: null,
        isLoading: true,
        user: null
    })

    const isInitialized = useRef(false)
    const lastValidationTime = useRef(0)
    const VALIDATION_COOLDOWN = 30000 // 30 segundos

    useEffect(() => {
        const initializeAuth = async () => {
            // Evitar múltiples inicializaciones
            if (isInitialized.current) return
            isInitialized.current = true

            try {
                const token = localStorage.getItem('authToken')
                const role = localStorage.getItem('userRole') as AuthState["role"]
                const email = localStorage.getItem('userEmail')

                console.log("AuthContext - initializeAuth - token:", !!token, "role:", role, "email:", email)

                if (token && role && email) {
                    // Solo validar si han pasado más de 30 segundos desde la última validación
                    const now = Date.now()
                    if (now - lastValidationTime.current > VALIDATION_COOLDOWN) {
                        try {
                            const validation = await apiService.validateToken()
                            console.log("AuthContext - validation result:", validation)

                            if (validation.valid && validation.user) {
                                console.log("AuthContext - setting state with user:", validation.user)
                                lastValidationTime.current = now
                                setState({
                                    role: validation.user.role?.toLowerCase() as AuthState["role"],
                                    email: validation.user.email,
                                    organizationId: validation.user.organizationId,
                                    isLoading: false,
                                    user: validation.user
                                })
                            } else {
                                // Token inválido, limpiar todo
                                console.log("AuthContext - token invalid, clearing state")
                                apiService.logout()
                                localStorage.removeItem('userRole')
                                localStorage.removeItem('userEmail')
                                localStorage.removeItem('userName')
                                localStorage.removeItem('userOrganizationId')
                                setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
                            }
                        } catch (error) {
                            console.warn("AuthContext - validation failed, using cached data:", error)
                            // Si la validación falla pero tenemos datos en localStorage, usarlos
                            setState({
                                role: role,
                                email: email,
                                organizationId: localStorage.getItem('userOrganizationId'),
                                isLoading: false,
                                user: null // No tenemos el usuario completo, pero podemos continuar
                            })
                        }
                    } else {
                        // Usar datos cacheados si la validación fue reciente
                        console.log("AuthContext - using cached data (recent validation)")
                        setState({
                            role: role,
                            email: email,
                            organizationId: localStorage.getItem('userOrganizationId'),
                            isLoading: false,
                            user: null
                        })
                    }
                } else {
                    console.log("AuthContext - no token/role/email, setting empty state")
                    setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
                }
            } catch (error) {
                console.error("AuthContext Error:", error)
                // Solo limpiar si es un error crítico, no por problemas de red
                if (error instanceof TypeError && error.message.includes('fetch')) {
                    console.warn("AuthContext - network error, keeping cached data")
                    const role = localStorage.getItem('userRole') as AuthState["role"]
                    const email = localStorage.getItem('userEmail')
                    if (role && email) {
                        setState({
                            role: role,
                            email: email,
                            organizationId: localStorage.getItem('userOrganizationId'),
                            isLoading: false,
                            user: null
                        })
                    } else {
                        setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
                    }
                } else {
                    apiService.logout()
                    localStorage.removeItem('userRole')
                    localStorage.removeItem('userEmail')
                    localStorage.removeItem('userName')
                    localStorage.removeItem('userOrganizationId')
                    setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
                }
            }
        }

        initializeAuth()
    }, []) // Solo ejecutar una vez al montar el componente

    const login = async (email: string, password: string) => {
        try {
            const response = await apiService.login({ email, password })
            const role = response.user.role?.toLowerCase() as AuthState["role"]

            // Guardar en localStorage para persistencia
            localStorage.setItem('userRole', role || '')
            localStorage.setItem('userEmail', response.user.email)
            localStorage.setItem('userName', response.user.name)
            localStorage.setItem('userOrganizationId', response.user.organizationId || '')

            setState({
                role: role,
                email: response.user.email,
                organizationId: response.user.organizationId,
                isLoading: false,
                user: response.user as User
            })

            return { user: response.user as User }
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
        localStorage.removeItem('userOrganizationId')
        setState({ role: null, email: null, organizationId: null, isLoading: false, user: null })
    }

    return (
        <AuthContext.Provider value={{
            ...state,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

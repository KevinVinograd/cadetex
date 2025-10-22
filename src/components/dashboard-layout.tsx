import { type ReactNode, useEffect, useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Truck, FileText, LogOut, Menu, X, Package, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { ThemeToggle } from "./theme-toggle"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children: _children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { role, email, user, logout, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !role) {
      navigate("/login")
    }
  }, [role, isLoading, navigate])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Different navigation items based on user role
  const getNavItems = () => {
    if (role === "COURIER") {
      return [
        { href: "/courier", label: "My Tasks", icon: Package },
      ]
    } else if (role === "SUPERADMIN") {
      return [
        { href: "/superadmin", label: "Organizaciones", icon: Building2 },
        { href: "/user-management", label: "Usuarios", icon: Users },
      ]
    } else {
      // For orgadmin
      return [
        { href: "/dashboard", label: "Tasks", icon: LayoutDashboard },
        { href: "/dashboard/clients", label: "Clients", icon: Users },
        { href: "/dashboard/couriers", label: "Couriers", icon: Truck },
        { href: "/dashboard/providers", label: "Providers", icon: Building2 },
        { href: "/dashboard/reports", label: "Reports", icon: FileText },
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-background">
          {/* Mobile menu button */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
            <div className="flex items-center justify-between p-4">
              <h1 className="text-lg font-semibold text-foreground">
                {role === "courier" ? "Courier Portal" : "Courier Management"}
              </h1>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300",
          "lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
              <div className="p-6 border-b border-sidebar-border">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-sidebar-foreground text-balance">
                    {role === "COURIER" ? "Courier Portal" : 
                     role === "SUPERADMIN" ? "Super Admin" : 
                     "Courier Management"}
                  </h1>
                  <ThemeToggle />
                </div>
              </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-sidebar-foreground">{user?.name || email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="pt-16 lg:pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

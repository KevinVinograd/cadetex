import { type ReactNode, useEffect, useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Truck, FileText, LogOut, Menu, X, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { ThemeToggle } from "./theme-toggle"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { role } = useAuth()

  useEffect(() => {
    const name = localStorage.getItem("userName")
    const role = localStorage.getItem("userRole")
    if (!name || !role) {
      navigate("/login")
    } else {
      setUserName(name)
      setUserRole(role)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    navigate("/login")
  }

  // Different navigation items based on user role
  const getNavItems = () => {
    if (role === "courier") {
      return [
        { href: "/courier", label: "My Tasks", icon: Package },
      ]
    } else {
      // For orgadmin and superadmin
      return [
        { href: "/dashboard", label: "Tasks", icon: LayoutDashboard },
        { href: "/dashboard/clients", label: "Clients", icon: Users },
        { href: "/dashboard/couriers", label: "Couriers", icon: Truck },
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
                    {role === "courier" ? "Courier Portal" : "Courier Management"}
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
                <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
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

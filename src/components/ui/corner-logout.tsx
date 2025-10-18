"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function CornerLogout() {
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    try {
      const name = localStorage.getItem("userName") || localStorage.getItem("userEmail") || ""
      const role = localStorage.getItem("userRole") || ""
      setUserName(name)
      setUserRole(role)
    } catch {}
  }, [])

  const handleLogout = () => {
    try {
      localStorage.clear()
    } catch {}
    window.location.href = "/login"
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-card border rounded-md p-3 shadow-sm min-w-[220px]">
        <div className="mb-2">
          <p className="text-sm font-medium leading-none break-all">{userName}</p>
          {userRole ? <p className="text-xs text-muted-foreground capitalize">{userRole}</p> : null}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}



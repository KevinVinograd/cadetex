"use client"

import { useEffect, useState } from "react"
import { mockOrganizations } from "@/lib/mock-data"

export type AuthState = {
  role: "superadmin" | "orgadmin" | "courier" | null
  email: string | null
  organizationId: string | null
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ role: null, email: null, organizationId: null })

  useEffect(() => {
    try {
      const role = (localStorage.getItem("userRole") as AuthState["role"]) || null
      const email = localStorage.getItem("userEmail") || localStorage.getItem("userName") || null
      const stored = localStorage.getItem("orgs")
      const orgs = stored ? JSON.parse(stored) : mockOrganizations
      const org = email ? orgs.find((o: { adminEmail?: string }) => o.adminEmail?.toLowerCase() === email.toLowerCase()) : null
      setState({ role, email, organizationId: org?.id ?? null })
    } catch {
      setState({ role: null, email: null, organizationId: null })
    }
  }, [])

  return state
}

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import type { Organization } from "../lib/types"
import { mockOrganizations } from "../lib/mock-data"
import { CornerLogout } from "../components/ui/corner-logout"

export default function SuperAdminPage() {
  const navigate = useNavigate()
  
  if (typeof window !== "undefined") {
    const role = localStorage.getItem("userRole")
    if (role && role !== "superadmin") {
      navigate("/login")
      return null
    }
  }
  
  const handleLogout = () => {
    try {
      localStorage.clear()
    } catch {}
    navigate("/login")
  }
  
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [name, setName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("orgs")
    setOrgs(stored ? JSON.parse(stored) : mockOrganizations)
  }, [])

  const persist = (next: Organization[]) => {
    setOrgs(next)
    localStorage.setItem("orgs", JSON.stringify(next))
  }

  const handleCreate = () => {
    if (!name) return
    const id = `org-${Math.random().toString(36).slice(2, 8)}`
    persist([...orgs, { id, name, adminEmail: adminEmail || undefined }])
    setName("")
    setAdminEmail("")
  }

  const handleAssignAdmin = (id: string, email: string) => {
    const next = orgs.map((o) => (o.id === id ? { ...o, adminEmail: email || undefined } : o))
    persist(next)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CornerLogout />
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>Create organizations and assign an admin user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Organization name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Admin email (optional)" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            <Button onClick={handleCreate}>Create</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Admin Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>
                    <Input
                      className="h-9"
                      defaultValue={org.adminEmail || ""}
                      onBlur={(e) => handleAssignAdmin(org.id, e.target.value)}
                      placeholder="admin@company.com"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" onClick={() => handleAssignAdmin(org.id, "")}>Clear admin</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


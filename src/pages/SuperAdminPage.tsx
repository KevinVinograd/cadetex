import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { CornerLogout } from "../components/ui/corner-logout"
import { useAuth } from "../hooks/use-auth"
import { useOrganizations } from "../hooks/use-organizations"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2, Plus, Trash2, Users } from "lucide-react"
import { SuccessDialog } from "../components/ui/success-dialog"

export default function SuperAdminPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const { organizations, isLoading, error, createOrganization, deleteOrganization } = useOrganizations()
  
  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  
  
  // Estados para diálogos de confirmación
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'success'
  })
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  })

  console.log("SuperAdminPage - role:", role)
  console.log("SuperAdminPage - organizations:", organizations)
  console.log("SuperAdminPage - isLoading:", isLoading)

  if (role !== "superadmin") {
    console.log("SuperAdminPage - Redirecting to login, role:", role)
    navigate("/login")
    return null
  }
  

  const showSuccess = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSuccessDialog({
      isOpen: true,
      title,
      description,
      type
    })
  }

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm
    })
  }


  const handleCreate = async () => {
    if (!name.trim()) return
    
    try {
      setIsCreating(true)
      setCreateError("")
      await createOrganization({ name: name.trim() })
      setName("")
      showSuccess("Organización Creada", "La organización ha sido creada exitosamente.")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create organization"
      setCreateError(errorMessage)
      showSuccess("Error", errorMessage, "error")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    showConfirm(
      "Eliminar Organización",
      "¿Estás seguro de que quieres eliminar esta organización? Esta acción eliminará también todos los administradores asociados.",
      async () => {
        try {
          console.log("Deleting organization with id:", id)
          await deleteOrganization(id)
          console.log("Organization deleted successfully")
          showSuccess("Organización Eliminada", "La organización ha sido eliminada exitosamente.")
          // Recargar la lista para asegurar que se actualice
          setTimeout(() => window.location.reload(), 1500)
        } catch (err) {
          console.error("Failed to delete organization:", err)
          showSuccess("Error", `Error al eliminar la organización: ${err instanceof Error ? err.message : 'Error desconocido'}`, "error")
        }
      }
    )
  }


  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <CornerLogout />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <CornerLogout />
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Organizaciones</CardTitle>
          <CardDescription>Crea y administra las organizaciones del sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Input 
              placeholder="Organization name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </>
              )}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                      <Users className="h-4 w-4 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">Click en "Usuarios" para gestionar</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/organization-users/${org.id}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Usuarios
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(org.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Diálogo de éxito/error */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog(prev => ({ ...prev, isOpen: false }))}
        title={successDialog.title}
        description={successDialog.description}
        type={successDialog.type}
      />

      {/* Diálogo de confirmación */}
      <SuccessDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        type="warning"
        onConfirm={confirmDialog.onConfirm}
        confirmText="Confirmar"
        showCancel={true}
      />
    </div>
  )
}


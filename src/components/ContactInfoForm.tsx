import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Building2 } from "lucide-react"

interface ContactInfoFormProps {
  type: 'client' | 'provider'
  formData: {
    name: string
    legalName?: string
    email?: string
    phoneMobile?: string
    phoneFixed?: string
    contactName?: string // Solo para provider
    contactPhone?: string // Solo para provider
    isActive: boolean
  }
  onInputChange: (field: string, value: string | boolean) => void
  error?: string
  disabled?: boolean
}

export function ContactInfoForm({ 
  type, 
  formData, 
  onInputChange, 
  error,
  disabled = false
}: ContactInfoFormProps) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Información del {type === 'client' ? 'Cliente' : 'Proveedor'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              Nombre / Descripción *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className="mt-1"
              placeholder={`Nombre del ${type === 'client' ? 'cliente' : 'proveedor'}`}
              required
              disabled={disabled}
            />
          </div>
          
          {type === 'client' && (
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Razón Social</label>
              <Input
                value={formData.legalName || ""}
                onChange={(e) => onInputChange("legalName", e.target.value)}
                className="mt-1"
                placeholder="Razón social (opcional)"
                disabled={disabled}
              />
            </div>
          )}
          
          {type === 'client' ? (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => onInputChange("email", e.target.value)}
                  className="mt-1"
                  placeholder="cliente@empresa.com"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono Principal</label>
                <Input
                  value={formData.phoneMobile || formData.phoneFixed || ""}
                  onChange={(e) => {
                    if (formData.phoneMobile) {
                      onInputChange("phoneMobile", e.target.value)
                    } else {
                      onInputChange("phoneFixed", e.target.value)
                    }
                  }}
                  className="mt-1"
                  placeholder="+54 9 11 1234-5678"
                  disabled={disabled}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nombre de Contacto</label>
                <Input
                  value={formData.contactName || ""}
                  onChange={(e) => onInputChange("contactName", e.target.value)}
                  className="mt-1"
                  placeholder="Nombre del contacto"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono de Contacto</label>
                <Input
                  value={formData.contactPhone || ""}
                  onChange={(e) => onInputChange("contactPhone", e.target.value)}
                  className="mt-1"
                  placeholder="+54 9 11 1234-5678"
                  disabled={disabled}
                />
              </div>
            </>
          )}

          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Estado</label>
            <select
              value={formData.isActive ? "active" : "inactive"}
              onChange={(e) => onInputChange("isActive", e.target.value === "active")}
              className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              disabled={disabled}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


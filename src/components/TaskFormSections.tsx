import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { SearchableSelect } from "./ui/searchable-select"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Package, MapPin } from "lucide-react"

interface TaskFormSectionsProps {
  formData: any
  clients: any[]
  providers: any[]
  couriers?: any[]
  contactType: 'client' | 'provider'
  onInputChange: (field: string, value: string | boolean) => void
  onClientChange?: (clientId: string) => void
  onProviderChange?: (providerId: string) => void
  disabled?: boolean
}

export function BasicInfoSection({ formData, onInputChange, disabled }: Partial<TaskFormSectionsProps>) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Información Básica
        </CardTitle>
        <CardDescription>Detalles de la tarea</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Reference Vexa *</label>
            <Input
              value={formData.referenceBL}
              onChange={(e) => onInputChange!("referenceBL", e.target.value)}
              className="mt-1"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Tipo de Tarea *</label>
            <Select value={formData.type} onValueChange={(value) => onInputChange!("type", value)} disabled={disabled}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retiro">Retiro</SelectItem>
                <SelectItem value="entrega">Entrega</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Estado *</label>
            <Select value={formData.status} onValueChange={(value) => onInputChange!("status", value)} disabled={disabled}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_preparacion">En Preparación</SelectItem>
                <SelectItem value="pendiente_confirmar">Pendiente Confirmar</SelectItem>
                <SelectItem value="confirmada_tomar">Confirmada</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Fecha Programada *</label>
            <Input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => onInputChange!("scheduledDate", e.target.value)}
              className="mt-1"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Prioridad</label>
            <Select value={formData.priority} onValueChange={(value) => onInputChange!("priority", value)} disabled={disabled}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Photo Required Checkbox */}
        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
          <Checkbox
            id="photoRequired"
            checked={formData.photoRequired}
            onCheckedChange={(checked) => onInputChange!("photoRequired", checked as boolean)}
            disabled={disabled}
          />
          <Label
            htmlFor="photoRequired"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Foto obligatoria al finalizar tarea
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}

export function ContactSelectionSection({ 
  formData, 
  clients, 
  providers, 
  contactType,
  onInputChange, 
  onClientChange, 
  onProviderChange,
  disabled
}: TaskFormSectionsProps) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Selección de Contacto
        </CardTitle>
        <CardDescription>Selecciona el tipo de contacto y el contacto específico</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Tipo de Contacto *</label>
          <Select value={contactType} onValueChange={(value) => {
            onInputChange("contactType", value)
          }} disabled={disabled}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Cliente</SelectItem>
              <SelectItem value="provider">Proveedor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            {contactType === "client" ? "Cliente" : "Proveedor"} *
          </label>
          {contactType === "client" ? (
            <SearchableSelect
              value={formData.contactId}
              onValueChange={(value) => {
                if (onClientChange) onClientChange(value)
                else onInputChange("contactId", value)
              }}
              items={(clients || []).map((c: any) => ({ id: String(c.id), name: c.name }))}
              placeholder="Buscar y seleccionar cliente..."
              disabled={disabled}
              ariaLabel="Cliente"
            />
          ) : (
            <SearchableSelect
              value={formData.contactId}
              onValueChange={(value) => {
                if (onProviderChange) onProviderChange(value)
                else onInputChange("contactId", value)
              }}
              items={(providers || []).map((p: any) => ({ id: String(p.id), name: p.name }))}
              placeholder="Buscar y seleccionar proveedor..."
              disabled={disabled}
              ariaLabel="Proveedor"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AddressSection({ 
  formData, 
  onInputChange, 
  clients, 
  providers,
  contactType,
  contactId,
  disabled
}: Partial<TaskFormSectionsProps> & { contactType?: string, contactId?: string, disabled?: boolean }) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {formData.type === "retiro" ? "Dirección de Recogida" : "Dirección de Entrega"}
        </CardTitle>
        <CardDescription>
          {formData.type === "retiro" 
            ? "Ubicación donde se recogerá la documentación" 
            : "Ubicación donde se entregará la documentación"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">Dirección *</label>
            {contactId && !disabled && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const contact = contactType === "client"
                    ? (clients || []).find(c => String(c.id) === String(contactId))
                    : (providers || []).find(p => String(p.id) === String(contactId))
                  if (contact) {
                    onInputChange!("address", (contact as any).address || "")
                    onInputChange!("city", (contact as any).city || "")
                    onInputChange!("contact", (contact as any).phoneNumber || (contact as any).contact || "")
                  }
                }}
                className="text-xs"
              >
                Usar dirección del contacto
              </Button>
            )}
          </div>
          <Textarea
            value={formData.address}
            onChange={(e) => onInputChange!("address", e.target.value)}
            className="mt-1"
            rows={3}
            placeholder={`Ingresa la dirección de ${formData.type === "retiro" ? "recogida" : "entrega"}...`}
            required
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Ciudad</label>
            <Input
              value={formData.city}
              onChange={(e) => onInputChange!("city", e.target.value)}
              className="mt-1"
              placeholder="Ciudad"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Contacto</label>
            <Input
              value={formData.contact}
              onChange={(e) => onInputChange!("contact", e.target.value)}
              className="mt-1"
              placeholder="Persona de contacto"
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CertificatesSection({ formData, onInputChange, disabled }: Partial<TaskFormSectionsProps>) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle>Certificados</CardTitle>
        <CardDescription>Documentos de la carga</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">MBL</label>
            <Input
              value={formData.mbl}
              onChange={(e) => onInputChange!("mbl", e.target.value)}
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">HBL</label>
            <Input
              value={formData.hbl}
              onChange={(e) => onInputChange!("hbl", e.target.value)}
              className="mt-1"
              disabled={disabled}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input 
              id="freightCert" 
              type="checkbox" 
              className="h-4 w-4" 
              checked={formData.freightCert} 
              onChange={(e) => onInputChange!("freightCert", e.target.checked)} 
              disabled={disabled}
            />
            <label htmlFor="freightCert" className="text-sm">Certificado de Flete</label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              id="foCert" 
              type="checkbox" 
              className="h-4 w-4" 
              checked={formData.foCert} 
              onChange={(e) => onInputChange!("foCert", e.target.checked)} 
              disabled={disabled}
            />
            <label htmlFor="foCert" className="text-sm">Certificado FO</label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              id="bunkerCert" 
              type="checkbox" 
              className="h-4 w-4" 
              checked={formData.bunkerCert} 
              onChange={(e) => onInputChange!("bunkerCert", e.target.checked)} 
              disabled={disabled}
            />
            <label htmlFor="bunkerCert" className="text-sm">Certificado de Combustible</label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotesSection({ formData, onInputChange, disabled }: Partial<TaskFormSectionsProps>) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle>Notas</CardTitle>
        <CardDescription>Información adicional</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={formData.notes}
          onChange={(e) => onInputChange!("notes", e.target.value)}
          className="mt-1"
          rows={4}
          placeholder="Agrega notas adicionales..."
          disabled={disabled}
        />
      </CardContent>
    </Card>
  )
}


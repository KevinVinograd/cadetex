import { Card, CardContent } from "./ui/card"
import { BasicInfoSection, ContactSelectionSection, AddressSection, CertificatesSection, NotesSection } from "./TaskFormSections"

interface TaskFormProps {
  formData: any
  clients: any[]
  providers: any[]
  couriers: any[]
  onInputChange: (field: string, value: string | boolean) => void
  onClientChange: (clientId: string) => void
  onProviderChange: (providerId: string) => void
  mode?: 'create' | 'edit' | 'clone'
}

export function TaskForm({ 
  formData, 
  clients, 
  providers, 
  couriers, 
  onInputChange, 
  onClientChange, 
  onProviderChange,
  mode = 'create'
}: TaskFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <BasicInfoSection 
          formData={formData} 
          onInputChange={onInputChange} 
        />

        <ContactSelectionSection
          formData={formData}
          clients={clients || []}
          providers={providers || []}
          couriers={couriers || []}
          contactType={formData.contactType as 'client' | 'provider'}
          onInputChange={onInputChange}
          onClientChange={onClientChange}
          onProviderChange={onProviderChange}
        />

        <AddressSection 
          formData={formData}
          clients={clients || []}
          providers={providers || []}
          onInputChange={onInputChange}
          contactType={formData.contactType as 'client' | 'provider'}
          contactId={formData.contactId}
        />

        <CertificatesSection 
          formData={formData} 
          onInputChange={onInputChange} 
        />

        <NotesSection 
          formData={formData} 
          onInputChange={onInputChange} 
        />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card className="border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {mode === 'clone' 
                ? 'Clonando tarea existente. Los campos de comprobante y fotos adicionales no se incluyen.'
                : 'El formulario incluye todos los campos necesarios para crear o editar una tarea.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


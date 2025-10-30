import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Building2 } from "lucide-react"
import { AddressMapPreview } from "./ui/address-map-preview"
import { SearchableSelect } from "./ui/searchable-select"
import { CitySearchable } from "./ui/city-searchable"
import { ARGENTINE_PROVINCES } from "../lib/argentine-provinces"

interface AddressFormProps {
  formData: {
    province: string
    city: string
    street: string
    streetNumber: string
    addressComplement: string
    postalCode: string
    notes?: string
  }
  onInputChange: (field: string, value: string) => void
  showNotes?: boolean
  notesPlaceholder?: string
  disabled?: boolean
}

export function AddressForm({ 
  formData, 
  onInputChange, 
  showNotes = true,
  notesPlaceholder = "Notas adicionales",
  disabled = false
}: AddressFormProps) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Dirección y Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Provincia / Estado *</label>
            <div className="mt-1">
              <SearchableSelect
                value={formData.province}
                onValueChange={(value) => {
                  onInputChange("province", value)
                  onInputChange("city", "")
                }}
                items={ARGENTINE_PROVINCES}
                placeholder="Buscar provincia..."
                ariaLabel="Provincia"
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Ciudad *</label>
            <div className="mt-1">
              <CitySearchable
                value={formData.city}
                onValueChange={(value) => onInputChange("city", value)}
                onCitySelect={(_, postalCode) => {
                  if (postalCode) {
                    onInputChange("postalCode", postalCode)
                  }
                }}
                province={formData.province}
                placeholder="Buscar ciudad..."
                disabled={disabled || !formData.province}
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Dirección *</label>
            <div className="space-y-3 mt-1">
              <div>
                <label className="text-xs text-muted-foreground">Nombre de la Calle *</label>
                <Input
                  value={formData.street}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/\d/g, '').trim()
                    onInputChange("street", value)
                  }}
                  className="mt-1"
                  placeholder="Ej: Belgrano, Av. Libertador, etc."
                  disabled={disabled || !formData.province || !formData.city}
                  required
                />
                {(!formData.province || !formData.city) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {!formData.province ? "Primero seleccione una provincia" : "Primero seleccione una ciudad"}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Número</label>
                  <Input
                    value={formData.streetNumber}
                    onChange={(e) => onInputChange("streetNumber", e.target.value)}
                    className="mt-1"
                    placeholder="123"
                    disabled={disabled}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Complemento</label>
                  <Input
                    value={formData.addressComplement}
                    onChange={(e) => onInputChange("addressComplement", e.target.value)}
                    className="mt-1"
                    placeholder="PISO 9, OF 610"
                    disabled={disabled}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Código Postal</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => onInputChange("postalCode", e.target.value)}
                  className="mt-1"
                  placeholder="C1021AAP (opcional)"
                  disabled={disabled}
                />
              </div>
            </div>
            <AddressMapPreview
              street={formData.street}
              streetNumber={formData.streetNumber}
              addressComplement={formData.addressComplement}
              city={formData.city}
              province={formData.province}
              postalCode={formData.postalCode}
            />
          </div>

          {showNotes && (
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) => onInputChange("notes", e.target.value)}
                className="mt-1"
                rows={2}
                placeholder={notesPlaceholder}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


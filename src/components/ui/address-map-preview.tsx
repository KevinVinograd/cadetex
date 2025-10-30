import { MapPin, ExternalLink } from "lucide-react"
import { Button } from "./button"

interface AddressMapPreviewProps {
  street?: string
  streetNumber?: string
  addressComplement?: string
  city?: string
  province?: string
  postalCode?: string
}

export function AddressMapPreview({
  street,
  streetNumber,
  addressComplement,
  city,
  province,
  postalCode
}: AddressMapPreviewProps) {
  // Construir dirección completa (sin complemento para evitar errores en el mapa)
  // Formatear para que Google Maps reconozca bien el código postal
  const addressParts: string[] = []
  
  if (street) {
    if (streetNumber) {
      addressParts.push(`${street} ${streetNumber}`)
    } else {
      addressParts.push(street)
    }
  }
  
  if (city) addressParts.push(city)
  if (province) addressParts.push(province)
  
  // Incluir código postal en un formato que Google Maps reconozca
  let fullAddress = addressParts.join(", ")
  if (postalCode) {
    // Agregar código postal al final, Google Maps lo reconocerá automáticamente
    fullAddress = `${fullAddress}, ${postalCode}`
  }

  if (!street || !city || !province) {
    return null
  }

  // Construir URL de Google Maps
  const encodedAddress = encodeURIComponent(fullAddress)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  return (
    <div className="mt-4 rounded-lg border border-input bg-muted/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Verificar ubicación</p>
            <p className="text-xs text-muted-foreground truncate">{fullAddress}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="ml-4 flex-shrink-0"
        >
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir en Google Maps
          </a>
        </Button>
      </div>
    </div>
  )
}


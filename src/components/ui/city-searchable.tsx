import { useEffect, useState } from "react"
import { SearchableSelect } from "./searchable-select"
import { Loader2 } from "lucide-react"

interface CitySearchableProps {
  value: string
  onValueChange: (value: string) => void
  onCitySelect?: (cityName: string, postalCode?: string) => void
  province?: string
  placeholder?: string
  disabled?: boolean
}

export function CitySearchable({
  value,
  onValueChange,
  onCitySelect,
  province,
  placeholder = "Buscar ciudad...",
  disabled = false
}: CitySearchableProps) {
  const [cities, setCities] = useState<Array<{ id: string; name: string; postalCode?: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!province || disabled || !province.trim()) {
      setCities([])
      return
    }

    const fetchCities = async () => {
      setIsLoading(true)
      try {
        // Usar Georef API para obtener ciudades según la provincia
        const url = `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(province)}&max=1000&orden=nombre`
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Error al obtener ciudades')
        }

        const data = await response.json()
        const localidades = data?.localidades || []
        
        // Agrupar por nombre y tomar el primer código postal disponible
        const cityMap = new Map<string, { id: string; name: string; postalCode?: string }>()
        
        localidades.forEach((loc: any) => {
          const cityName = loc.nombre
          const postalCode = loc.codigo_postal || loc.cp || loc.cod_postal || undefined
          
          if (!cityMap.has(cityName)) {
            cityMap.set(cityName, {
              id: cityName,
              name: cityName,
              postalCode: postalCode
            })
          } else {
            // Si ya existe pero no tenía código postal, intentar agregarlo
            const existing = cityMap.get(cityName)
            if (existing && !existing.postalCode && postalCode) {
              existing.postalCode = postalCode
            }
          }
        })
        
        const citiesList = Array.from(cityMap.values())
          .sort((a, b) => a.name.localeCompare(b.name))

        console.log('Ciudades cargadas con códigos postales:', citiesList.filter(c => c.postalCode).length, 'de', citiesList.length)
        setCities(citiesList)
      } catch (err) {
        console.error('Error fetching cities:', err)
        setCities([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce para evitar múltiples requests
    const timeoutId = setTimeout(fetchCities, 300)
    return () => clearTimeout(timeoutId)
  }, [province, disabled])

  if (!province) {
    return (
      <div className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-muted-foreground">
        Primero seleccione una provincia
      </div>
    )
  }

  if (isLoading && cities.length === 0) {
    return (
      <div className="mt-1 flex items-center justify-center w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-muted-foreground">Cargando ciudades...</span>
      </div>
    )
  }

  // Mostrar SearchableSelect siempre que tengamos provincia, aunque esté vacío
  // El componente manejará el estado vacío internamente
  return (
    <div className="relative">
      {isLoading ? (
        <div className="mt-1 flex items-center justify-center w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-muted-foreground">Cargando ciudades...</span>
        </div>
      ) : (
        <SearchableSelect
          value={value}
          onValueChange={(cityId) => {
            onValueChange(cityId)
            // Buscar el código postal de la ciudad seleccionada
            const selectedCity = cities.find(c => c.id === cityId)
            console.log('Ciudad seleccionada:', selectedCity)
            if (selectedCity && onCitySelect) {
              console.log('Llamando onCitySelect con:', selectedCity.name, selectedCity.postalCode)
              onCitySelect(selectedCity.name, selectedCity.postalCode)
            }
          }}
          items={cities}
          placeholder={cities.length === 0 ? "No hay ciudades disponibles" : placeholder}
          disabled={disabled || isLoading || cities.length === 0}
          ariaLabel="Ciudad"
        />
      )}
    </div>
  )
}


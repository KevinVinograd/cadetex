import React, { useEffect, useMemo, useRef, useState } from "react"

type AddressSuggestion = {
  label: string
  street?: string
  streetNumber?: string
  city?: string
  province?: string
  postalCode?: string
}

interface AddressAutocompleteProps {
  placeholder?: string
  initialQuery?: string
  provinceHint?: string
  cityHint?: string
  disabled?: boolean
  onSelect: (addr: AddressSuggestion) => void
  onClear?: () => void
}

// Simple debounce hook
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

export function AddressAutocomplete({ placeholder = "Buscar dirección (AR)", initialQuery = "", provinceHint, cityHint, disabled = false, onSelect, onClear }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(initialQuery)
  const [previousQuery, setPreviousQuery] = useState(initialQuery)
  const debouncedQuery = useDebouncedValue(query, 250)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Detectar cuando se borra el campo y limpiar campos relacionados
  useEffect(() => {
    // Si había un valor antes y ahora está vacío, significa que se borró
    if (previousQuery && previousQuery.trim() && (!query || !query.trim()) && onClear) {
      onClear()
    }
    setPreviousQuery(query)
  }, [query, previousQuery, onClear])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchAll() {
      if (disabled || !debouncedQuery || debouncedQuery.trim().length < 2 || !provinceHint?.trim()) {
        setSuggestions([])
        return
      }
      try {
        setIsLoading(true)
        // Build Georef request
        const geoParams = new URLSearchParams()
        geoParams.set("direccion", debouncedQuery)
        geoParams.set("max", "7")
        if (provinceHint && provinceHint.trim()) geoParams.set("provincia", provinceHint.trim())
        if (cityHint && cityHint.trim()) geoParams.set("localidad", cityHint.trim())
        const georefUrl = `https://apis.datos.gob.ar/georef/api/direcciones?${geoParams.toString()}`

        // Build Nominatim request (always include Argentina for context)
        const qParts = [debouncedQuery]
        if (cityHint && cityHint.trim()) qParts.push(cityHint.trim())
        if (provinceHint && provinceHint.trim()) qParts.push(provinceHint.trim())
        qParts.push("Argentina")
        const q = qParts.join(", ")
        const nomiUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=7&q=${encodeURIComponent(q)}`

        const [geoRes, nomiRes] = await Promise.allSettled([
          fetch(georefUrl).then(r => r.json()).catch(() => ({ direcciones: [] })),
          fetch(nomiUrl, { headers: { 'Accept-Language': 'es' } }).then(r => r.json()).catch(() => [])
        ])

        const geoJson: any = geoRes.status === 'fulfilled' ? geoRes.value : { direcciones: [] }
        const nomiJson: any[] = nomiRes.status === 'fulfilled' ? nomiRes.value : []

        const geoMapped: AddressSuggestion[] = (geoJson?.direcciones || []).map((d: any) => {
          const street: string | undefined = d?.calle?.nombre || undefined
          const streetNumber: string | undefined = d?.altura?.valor ? String(d.altura.valor) : undefined
          const city: string | undefined = d?.localidad_censal?.nombre || d?.localidad?.nombre || undefined
          const province: string | undefined = d?.provincia?.nombre || undefined
          const postalCode: string | undefined = d?.codigo_postal || d?.cp || undefined
          // Construir label sin número: solo Calle, Ciudad, Provincia
          // Limpiar nomenclatura si incluye el número al inicio
          let nomenclatura = d?.nomenclatura || ""
          if (nomenclatura && streetNumber) {
            // Si nomenclatura empieza con el número, quitarlo
            const numberPrefix = new RegExp(`^${streetNumber}\\s*-?\\s*`, "i")
            nomenclatura = nomenclatura.replace(numberPrefix, "").trim()
          }
          const label: string = nomenclatura || [street, city, province].filter(Boolean).join(", ") || ""
          return { label, street, streetNumber, city, province, postalCode }
        })

        const nomiMapped: AddressSuggestion[] = (nomiJson || []).map((n: any) => {
          const addr = n?.address || {}
          const street: string | undefined = addr.road || addr.pedestrian || addr.footway || undefined
          const streetNumber: string | undefined = addr.house_number || undefined
          const city: string | undefined = addr.city || addr.town || addr.village || addr.suburb || undefined
          const province: string | undefined = addr.state || undefined
          const postalCode: string | undefined = addr.postcode || undefined
          // Construir label sin número: solo Calle, Ciudad, Provincia
          const label: string = [street, city, province].filter(Boolean).join(", ") || ""
          return { label, street, streetNumber, city, province, postalCode }
        })

        // Merge unique by label
        const merged: AddressSuggestion[] = []
        const seen = new Set<string>()
        for (const s of [...geoMapped, ...nomiMapped]) {
          const key = s.label
          if (!key || seen.has(key)) continue
          seen.add(key)
          merged.push(s)
        }
        setSuggestions(merged)
        setIsOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [debouncedQuery, provinceHint, cityHint, disabled])

  const showList = useMemo(() => isOpen && (isLoading || suggestions.length > 0), [isOpen, isLoading, suggestions])

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={disabled ? "Primero complete la provincia" : placeholder}
        disabled={disabled}
        className="mt-1 block w-full px-3 py-2 border border-input bg-background rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {showList && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-input bg-popover shadow-sm max-h-64 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Buscando…</div>
          ) : suggestions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
          ) : (
            suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelect(sug)
                  setQuery(sug.label)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                {sug.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}



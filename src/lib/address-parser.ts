/**
 * Intenta parsear una dirección completa en componentes
 * Nota: Esta función es una aproximación y puede no funcionar perfectamente
 * para todos los formatos de direcciones
 */
export function parseAddress(fullAddress: string): {
  street: string
  streetNumber: string
  addressComplement: string
} {
  if (!fullAddress || !fullAddress.trim()) {
    return { street: "", streetNumber: "", addressComplement: "" }
  }

  // Intentar extraer número de la dirección
  // Patrones comunes: "Calle 123", "Av. Libertador 1234", "Calle 123 PISO 9"
  const numberMatch = fullAddress.match(/(\d+)/)
  const streetNumber = numberMatch ? numberMatch[1] : ""

  // Remover el número y dividir en partes
  let street = fullAddress.replace(/\d+/g, "").trim()
  
  // Intentar extraer complemento (PISO, DEPTO, OF, etc.)
  let addressComplement = ""
  const complementPattern = /(PISO|DEPTO|OF|OFICINA|APTO|APARTAMENTO)[\s\S]*/i
  const complementMatch = street.match(complementPattern)
  if (complementMatch) {
    addressComplement = complementMatch[0].trim()
    street = street.replace(complementPattern, "").trim()
  }

  // Limpiar espacios múltiples
  street = street.replace(/\s+/g, " ").trim()

  return {
    street,
    streetNumber,
    addressComplement
  }
}



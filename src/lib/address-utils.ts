export type AddressObject = {
  id?: string
  street?: string
  streetNumber?: string
  addressComplement?: string
  city?: string
  province?: string
  postalCode?: string
}

type FallbackParts = {
  street?: string
  streetNumber?: string
  addressComplement?: string
  city?: string
  province?: string
}

export function formatAddress(
  address?: string | AddressObject,
  fallback?: FallbackParts
): string {
  if (typeof address === 'string') {
    return address || ''
  }

  const street = address?.street ?? fallback?.street ?? ''
  const streetNumber = address?.streetNumber ?? fallback?.streetNumber ?? ''
  const addressComplement = address?.addressComplement ?? fallback?.addressComplement ?? ''
  const city = address?.city ?? fallback?.city ?? ''
  const province = address?.province ?? fallback?.province ?? ''

  const parts: string[] = []
  if (street) {
    parts.push(streetNumber ? `${street} ${streetNumber}` : street)
    if (addressComplement) parts.push(addressComplement)
  }
  const main = parts.join(' ').trim()

  const loc: string[] = []
  if (main) loc.push(main)
  if (city) loc.push(city)
  if (province) loc.push(province)

  return loc.join(', ')
}

export function getCity(
  address?: string | AddressObject,
  fallback?: { city?: string }
): string {
  if (typeof address === 'object' && address?.city) return address.city
  return fallback?.city ?? ''
}



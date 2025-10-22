import { useState, useEffect } from 'react'
import { apiService, Provider, CreateProviderRequest } from '@/lib/api'

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProviders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getProviders()
      setProviders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers')
    } finally {
      setIsLoading(false)
    }
  }

  const createProvider = async (data: CreateProviderRequest) => {
    try {
      const newProvider = await apiService.createProvider(data)
      setProviders(prev => [...prev, newProvider])
      return newProvider
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider')
      throw err
    }
  }

  const updateProvider = async (id: string, data: Partial<CreateProviderRequest>) => {
    try {
      const updatedProvider = await apiService.updateProvider(id, data)
      setProviders(prev => prev.map(provider => provider.id === id ? updatedProvider : provider))
      return updatedProvider
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider')
      throw err
    }
  }

  const deleteProvider = async (id: string) => {
    try {
      await apiService.deleteProvider(id)
      setProviders(prev => prev.filter(provider => provider.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete provider')
      throw err
    }
  }

  const getProviderById = (id: string) => {
    return providers.find(provider => provider.id === id)
  }

  const getProvidersByOrganization = (organizationId: string) => {
    return providers.filter(provider => provider.organizationId === organizationId)
  }

  useEffect(() => {
    fetchProviders()
  }, [])

  return {
    providers,
    isLoading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
    getProviderById,
    getProvidersByOrganization,
    refetch: fetchProviders
  }
}

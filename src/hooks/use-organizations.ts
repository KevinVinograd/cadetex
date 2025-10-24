import { useState, useEffect } from 'react'
import { apiService, Organization, CreateOrganizationRequest } from '@/lib/api'

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getOrganizations()
      setOrganizations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations')
    } finally {
      setIsLoading(false)
    }
  }

  const createOrganization = async (data: CreateOrganizationRequest) => {
    try {
      const newOrg = await apiService.createOrganization(data)
      setOrganizations(prev => [...prev, newOrg])
      return newOrg
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization')
      throw err
    }
  }

  const updateOrganization = async (id: string, data: Partial<CreateOrganizationRequest>) => {
    try {
      const updatedOrg = await apiService.updateOrganization(id, data)
      setOrganizations(prev => prev.map(org => org.id === id ? updatedOrg : org))
      return updatedOrg
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization')
      throw err
    }
  }

  const deleteOrganization = async (id: string) => {
    try {
      await apiService.deleteOrganization(id)
      setOrganizations(prev => prev.filter(org => org.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization')
      throw err
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  return {
    organizations,
    isLoading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    refetch: fetchOrganizations
  }
}




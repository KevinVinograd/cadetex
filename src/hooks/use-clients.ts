import { useState, useEffect } from 'react'
import { apiService, Client, CreateClientRequest } from '@/lib/api'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getClients()
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setIsLoading(false)
    }
  }

  const createClient = async (data: CreateClientRequest) => {
    try {
      const newClient = await apiService.createClient(data)
      setClients(prev => [...prev, newClient])
      return newClient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client')
      throw err
    }
  }

  const updateClient = async (id: string, data: Partial<CreateClientRequest>) => {
    try {
      const updatedClient = await apiService.updateClient(id, data)
      setClients(prev => prev.map(client => client.id === id ? updatedClient : client))
      return updatedClient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client')
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    try {
      await apiService.deleteClient(id)
      setClients(prev => prev.filter(client => client.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client')
      throw err
    }
  }

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id)
  }

  const getClientsByOrganization = (organizationId: string) => {
    return clients.filter(client => client.organizationId === organizationId)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    getClientsByOrganization,
    refetch: fetchClients
  }
}



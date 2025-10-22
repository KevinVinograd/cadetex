import { useState, useEffect } from 'react'
import { apiService, Courier, CreateCourierRequest } from '@/lib/api'

export function useCouriers() {
  const [couriers, setCouriers] = useState<Courier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCouriers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getCouriers()
      setCouriers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch couriers')
    } finally {
      setIsLoading(false)
    }
  }

  const createCourier = async (data: CreateCourierRequest) => {
    try {
      const newCourier = await apiService.createCourier(data)
      setCouriers(prev => [...prev, newCourier])
      return newCourier
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create courier')
      throw err
    }
  }

  const updateCourier = async (id: string, data: Partial<CreateCourierRequest>) => {
    try {
      const updatedCourier = await apiService.updateCourier(id, data)
      setCouriers(prev => prev.map(courier => courier.id === id ? updatedCourier : courier))
      return updatedCourier
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update courier')
      throw err
    }
  }

  const deleteCourier = async (id: string) => {
    try {
      await apiService.deleteCourier(id)
      setCouriers(prev => prev.filter(courier => courier.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete courier')
      throw err
    }
  }

  const getCourierById = (id: string) => {
    return couriers.find(courier => courier.id === id)
  }

  const getCouriersByOrganization = (organizationId: string) => {
    return couriers.filter(courier => courier.organizationId === organizationId)
  }

  useEffect(() => {
    fetchCouriers()
  }, [])

  return {
    couriers,
    isLoading,
    error,
    createCourier,
    updateCourier,
    deleteCourier,
    getCourierById,
    getCouriersByOrganization,
    refetch: fetchCouriers
  }
}



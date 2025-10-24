import { useState, useEffect } from 'react'
import { apiService, User, CreateUserRequest } from '@/lib/api'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const createUser = async (data: CreateUserRequest) => {
    try {
      const newUser = await apiService.createUser(data)
      setUsers(prev => [...prev, newUser])
      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      throw err
    }
  }

  const updateUser = async (id: string, data: Partial<CreateUserRequest>) => {
    try {
      const updatedUser = await apiService.updateUser(id, data)
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await apiService.deleteUser(id)
      setUsers(prev => prev.filter(user => user.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
      throw err
    }
  }

  const getUsersByOrganization = (organizationId: string) => {
    return users.filter(user => user.organizationId === organizationId)
  }

  const getAdminsByOrganization = (organizationId: string) => {
    return users.filter(user => 
      user.organizationId === organizationId && 
      user.role === 'ORGADMIN'
    )
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUsersByOrganization,
    getAdminsByOrganization,
    refetch: fetchUsers
  }
}




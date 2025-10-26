import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api', () => ({
  apiService: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  }
}))
import { apiService } from '@/lib/api'
import { useUsers } from '../use-users'

describe('useUsers', () => {
  beforeEach(() => vi.resetAllMocks())

  it('carga usuarios (éxito)', async () => {
    ;(apiService.getUsers as any).mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'a@a.com', role: 'ORGADMIN', isActive: true, organizationId: 'o1', createdAt: '', updatedAt: '' },
    ])
    const { result } = renderHook(() => useUsers())
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.users).toHaveLength(1)
    })
  })

  it('maneja error de carga', async () => {
    ;(apiService.getUsers as any).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useUsers())
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toMatch(/boom/i)
      expect(result.current.users).toHaveLength(0)
    })
  })

  it('createUser agrega usuario', async () => {
    ;(apiService.getUsers as any).mockResolvedValue([])
    ;(apiService.createUser as any).mockResolvedValue(
      { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'COURIER', isActive: true, organizationId: 'o1', createdAt: '', updatedAt: '' }
    )
    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.createUser({ organizationId: 'o1', name: 'Bob', email: 'b@b.com', password: 'x', role: 'COURIER' })
    await waitFor(() => {
      expect(result.current.users).toHaveLength(1)
    })
  })

  it('updateUser modifica usuario', async () => {
    ;(apiService.getUsers as any).mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'a@a.com', role: 'COURIER', isActive: true, organizationId: 'o1', createdAt: '', updatedAt: '' },
    ])
    ;(apiService.updateUser as any).mockResolvedValue(
      { id: 'u1', name: 'Alice+', email: 'a@a.com', role: 'COURIER', isActive: true, organizationId: 'o1', createdAt: '', updatedAt: '' }
    )
    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.updateUser('u1', { name: 'Alice+' })
    await waitFor(() => {
      expect(result.current.users[0].name).toBe('Alice+')
    })
  })

  it('deleteUser elimina por id', async () => {
    ;(apiService.getUsers as any).mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'a@a.com', role: 'COURIER', isActive: true, organizationId: 'o1', createdAt: '', updatedAt: '' },
    ])
    ;(apiService.deleteUser as any).mockResolvedValue(undefined)
    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.deleteUser('u1')
    await waitFor(() => {
      expect(result.current.users).toHaveLength(0)
    })
  })

  it('filtros por organización', async () => {
    ;(apiService.getUsers as any).mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'a@a.com', role: 'ORGADMIN', isActive: true, organizationId: 'o1', createdAt: '', updatedAt: '' },
      { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'COURIER', isActive: true, organizationId: 'o2', createdAt: '', updatedAt: '' },
    ])
    const { result } = renderHook(() => useUsers())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.getUsersByOrganization('o1').map(u => u.id)).toEqual(['u1'])
  })
})



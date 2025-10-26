import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api', () => ({
  apiService: {
    getOrganizations: vi.fn(),
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    deleteOrganization: vi.fn(),
  }
}))
import { apiService } from '@/lib/api'
import { useOrganizations } from '../use-organizations'

describe('useOrganizations', () => {
  beforeEach(() => vi.resetAllMocks())

  it('carga organizaciones (éxito)', async () => {
    ;(apiService.getOrganizations as any).mockResolvedValue([
      { id: '1', name: 'Org A', createdAt: '', updatedAt: '' }
    ])
    const { result } = renderHook(() => useOrganizations())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.organizations).toHaveLength(1)
    })
  })

  it('maneja error de carga', async () => {
    ;(apiService.getOrganizations as any).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useOrganizations())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toMatch(/boom/i)
      expect(result.current.organizations).toHaveLength(0)
    })
  })

  it('createOrganization actualiza estado', async () => {
    ;(apiService.getOrganizations as any).mockResolvedValue([])
    ;(apiService.createOrganization as any).mockResolvedValue(
      { id: '2', name: 'Org B', createdAt: '', updatedAt: '' }
    )

    const { result } = renderHook(() => useOrganizations())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.createOrganization({ name: 'Org B' })
    await waitFor(() => {
      expect(result.current.organizations).toHaveLength(1)
      expect(result.current.organizations[0].name).toBe('Org B')
    })
  })

  it('updateOrganization modifica organización por id', async () => {
    ;(apiService.getOrganizations as any).mockResolvedValue([
      { id: '1', name: 'Org A', createdAt: '', updatedAt: '' }
    ])
    ;(apiService.updateOrganization as any).mockResolvedValue(
      { id: '1', name: 'Org A++', createdAt: '', updatedAt: '' }
    )
    const { result } = renderHook(() => useOrganizations())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.updateOrganization('1', { name: 'Org A++' })
    await waitFor(() => {
      expect(result.current.organizations[0].name).toBe('Org A++')
    })
  })

  it('deleteOrganization elimina por id', async () => {
    ;(apiService.getOrganizations as any).mockResolvedValue([
      { id: '1', name: 'Org A', createdAt: '', updatedAt: '' }
    ])
    ;(apiService.deleteOrganization as any).mockResolvedValue(undefined)
    const { result } = renderHook(() => useOrganizations())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.deleteOrganization('1')
    await waitFor(() => {
      expect(result.current.organizations).toHaveLength(0)
    })
  })

  it('refetch vuelve a cargar', async () => {
    const mock = (apiService.getOrganizations as any)
    mock.mockResolvedValueOnce([])
    const { result } = renderHook(() => useOrganizations())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mock.mockResolvedValueOnce([{ id: '9', name: 'Nueve', createdAt: '', updatedAt: '' }])
    await result.current.refetch()
    await waitFor(() => {
      expect(result.current.organizations).toHaveLength(1)
      expect(result.current.organizations[0].id).toBe('9')
    })
  })
})



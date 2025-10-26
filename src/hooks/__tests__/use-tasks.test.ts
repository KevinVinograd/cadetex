import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api', () => ({
  apiService: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    getTask: vi.fn(),
    getTasksByOrganization: vi.fn(),
    getTasksByCourier: vi.fn(),
    updateTaskStatus: vi.fn(),
    uploadTaskPhoto: vi.fn(),
  }
}))
import { apiService } from '@/lib/api'
import { useTasks } from '../use-tasks'

describe('useTasks', () => {
  beforeEach(() => vi.resetAllMocks())

  it('fetchTasks carga lista', async () => {
    ;(apiService.getTasks as any).mockResolvedValue([ { id: 't1' } ])
    const { result } = renderHook(() => useTasks())
    await result.current.fetchTasks()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toHaveLength(1)
  })

  it('create/update/delete actualizan estado', async () => {
    ;(apiService.getTasks as any).mockResolvedValue([])
    const { result } = renderHook(() => useTasks())
    await result.current.fetchTasks()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    ;(apiService.createTask as any).mockResolvedValue({ id: 't2' })
    await result.current.createTask({ organizationId: 'o1', type: 'DELIVER', priority: 'NORMAL' })
    await waitFor(() => expect(result.current.tasks).toHaveLength(1))

    ;(apiService.updateTask as any).mockResolvedValue({ id: 't2', notes: 'upd' })
    await result.current.updateTask('t2', { notes: 'upd' })
    await waitFor(() => expect(result.current.tasks[0]).toMatchObject({ id: 't2', notes: 'upd' }))

    ;(apiService.deleteTask as any).mockResolvedValue(undefined)
    await result.current.deleteTask('t2')
    await waitFor(() => expect(result.current.tasks).toHaveLength(0))
  })

  it('getTaskById setea currentTask y luego error', async () => {
    ;(apiService.getTask as any).mockResolvedValueOnce({ id: 't3' })
    const { result } = renderHook(() => useTasks())

    await result.current.getTaskById('t3')
    await waitFor(() => expect(result.current.currentTask).toMatchObject({ id: 't3' }))

    ;(apiService.getTask as any).mockRejectedValueOnce(new Error('boom'))
    await result.current.getTaskById('nope')
    await waitFor(() => expect(result.current.taskError).toMatch(/error/i))
    expect(result.current.currentTask).toBeNull()
  })

  it('getTasksByOrganization y getTasksByCourier', async () => {
    ;(apiService.getTasksByOrganization as any).mockResolvedValue([ { id: 't4' } ])
    ;(apiService.getTasksByCourier as any).mockResolvedValue([ { id: 't5' } ])
    const { result } = renderHook(() => useTasks())

    const orgTasks = await result.current.getTasksByOrganization('o1')
    expect(orgTasks).toHaveLength(1)
    await waitFor(() => expect(result.current.tasks[0].id).toBe('t4'))

    const courierTasks = await result.current.getTasksByCourier('r1')
    expect(courierTasks).toHaveLength(1)
    await waitFor(() => expect(result.current.tasks[0].id).toBe('t5'))
  })

  it('updateTaskStatus y uploadTaskPhoto', async () => {
    ;(apiService.updateTaskStatus as any).mockResolvedValue({ id: 't6', status: 'CONFIRMED' })
    ;(apiService.uploadTaskPhoto as any).mockResolvedValue({ photoUrl: 'http://x/y.png' })
    const { result } = renderHook(() => useTasks())
    await result.current.fetchTasks()
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const upd = await result.current.updateTaskStatus('t6', 'CONFIRMED')
    expect(upd).toMatchObject({ id: 't6', status: 'CONFIRMED' })

    const url = await result.current.uploadTaskPhoto('t6', new File(['x'], 'x.png'))
    expect(url).toBe('http://x/y.png')
  })
})



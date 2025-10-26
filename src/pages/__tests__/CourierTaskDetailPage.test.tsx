import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('/src/hooks/use-tasks', () => ({
  useTasks: () => ({
    getTaskById: vi.fn().mockResolvedValue({ id: 't1' }),
    currentTask: { id: 't1', referenceBL: 'REF-11', type: 'entrega', status: 'confirmada_tomar', priority: 'normal', scheduledDate: '2025-01-01' },
    isLoadingTask: false,
    taskError: null,
  })
}))

async function renderDetail(path = '/courier/tasks/t1') {
  const { default: CourierTaskDetailPage } = await import('../CourierTaskDetailPage')
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/courier/tasks/:id" element={<CourierTaskDetailPage />} />
        <Route path="/courier" element={<div>COURIER_HOME</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CourierTaskDetailPage', () => {
  beforeEach(() => vi.resetModules())

  it('muestra detalle básico', async () => {
    await renderDetail()
    expect(screen.getByText(/Task Details/i)).toBeInTheDocument()
    expect(screen.getAllByText(/REF-11/i).length).toBeGreaterThan(0)
  })

  it('muestra loading', async () => {
    vi.doMock('/src/hooks/use-tasks', () => ({
      useTasks: () => ({ getTaskById: vi.fn(), currentTask: null, isLoadingTask: true, taskError: null })
    }))
    await renderDetail()
    expect(screen.getByText(/Loading Task/i)).toBeInTheDocument()
  })

  it('muestra error y permite volver', async () => {
    vi.doMock('/src/hooks/use-tasks', () => ({
      useTasks: () => ({ getTaskById: vi.fn(), currentTask: null, isLoadingTask: false, taskError: 'boom' })
    }))
    await renderDetail()
    expect(screen.getByText(/Error Loading Task/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back to My Tasks/i })).toBeInTheDocument()
  })

  it('muestra not found cuando no hay tarea', async () => {
    vi.doMock('/src/hooks/use-tasks', () => ({
      useTasks: () => ({ getTaskById: vi.fn(), currentTask: null, isLoadingTask: false, taskError: null })
    }))
    await renderDetail()
    expect(screen.getByText(/Task Not Found/i)).toBeInTheDocument()
  })
})



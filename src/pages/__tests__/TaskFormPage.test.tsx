import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

beforeEach(() => vi.resetModules())

describe('TaskFormPage (smoke)', () => {
  it('renderiza creación de tarea (Nueva Tarea)', async () => {
    vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role: 'orgadmin', organizationId: 'org-1' }) }))
    vi.doMock('/src/hooks/use-tasks', () => ({ useTasks: () => ({ createTask: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn(), getTaskById: vi.fn(), currentTask: null, isLoadingTask: false, taskError: null }) }))
    vi.doMock('/src/hooks/use-clients', () => ({ useClients: () => ({ getClientsByOrganization: () => [] }) }))
    vi.doMock('/src/hooks/use-providers', () => ({ useProviders: () => ({ getProvidersByOrganization: () => [] }) }))
    vi.doMock('/src/hooks/use-couriers', () => ({ useCouriers: () => ({ getCouriersByOrganization: () => [] }) }))

    const { default: TaskFormPage } = await import('../TaskFormPage')
    render(
      <MemoryRouter initialEntries={["/dashboard/tasks/new"]}>
        <Routes>
          <Route path="/dashboard/tasks/new" element={<TaskFormPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: /Nueva Tarea/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Crea una nueva tarea/i)).toBeInTheDocument()
  })
})




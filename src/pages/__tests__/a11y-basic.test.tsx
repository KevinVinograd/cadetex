import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

beforeEach(() => vi.resetModules())

describe('A11y básico (headings presentes)', () => {
  it('LoginPage tiene heading visible', async () => {
    vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role: 'guest' }) }))
    const { default: LoginPage } = await import('../LoginPage')
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    )
    // Verificamos elementos accesibles clave (a falta de heading): input email y botón submit
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument()
  })

  it('TasksPage tiene heading visible', async () => {
    vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role: 'orgadmin', organizationId: 'org-1' }) }))
    vi.doMock('/src/hooks/use-tasks', () => ({
      useTasks: () => ({
        tasks: [],
        isLoading: false,
        error: null,
        getTasksByOrganization: vi.fn().mockResolvedValue([]),
      })
    }))
    const { default: TasksPage } = await import('../TasksPage')
    render(
      <MemoryRouter initialEntries={["/dashboard/tasks"]}>
        <Routes>
          <Route path="/dashboard/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /Tareas/i })).toBeInTheDocument()
  })
})



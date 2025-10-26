import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

function mockAuth(role: string) {
  vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role }) }))
}

const tasks = [
  { id: 't1', referenceNumber: 'REF-1', type: 'DELIVER', status: 'CONFIRMED', priority: 'NORMAL', createdAt: new Date().toISOString() },
]

beforeEach(() => {
  vi.resetModules()
})

async function renderPage() {
  const { default: TasksPage } = await import('../TasksPage')
  return render(
    <MemoryRouter initialEntries={["/dashboard/tasks"]}>
      <Routes>
        <Route path="/dashboard/tasks" element={<TasksPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('TasksPage (smoke)', () => {
  it('renderiza listado y estadísticas para orgadmin', async () => {
    mockAuth('orgadmin')
    vi.doMock('/src/hooks/use-tasks', () => ({
      useTasks: () => ({ tasks, isLoading: false, error: null, deleteTask: vi.fn() })
    }))
    await renderPage()
    expect(screen.getByRole('heading', { name: /Tareas/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Lista de Tareas/i)).toBeInTheDocument()
    expect(screen.getByText(/REF-1/i)).toBeInTheDocument()
  })
})



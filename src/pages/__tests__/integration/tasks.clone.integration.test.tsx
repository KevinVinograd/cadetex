import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../App'

beforeEach(() => {
  vi.resetModules()
  localStorage.setItem('authToken', 'test')
  localStorage.setItem('userRole', 'orgadmin')
  localStorage.setItem('userEmail', 'a@b.com')
  localStorage.setItem('userOrganizationId', 'org-1')
  localStorage.setItem('clonedTask', JSON.stringify({
    id: 'task-1',
    type: 'DELIVER',
    referenceNumber: 'REF-OLD',
    clientId: 'client-1',
    scheduledDate: '2025-12-31',
    status: 'PENDING',
    priority: 'NORMAL'
  }))
})

describe('Tasks - clone (integration)', () => {
  it('prefill desde localStorage y crea nueva tarea', async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/tasks/clone/old"]}>
        <App />
      </MemoryRouter>
    )

    // Completar dirección en campos actuales (Nombre de la Calle)
    const streetInput = await screen.findByPlaceholderText(/Belgrano|Libertador/i)
    await userEvent.clear(streetInput)
    await userEvent.type(streetInput, 'Av 1')

    await userEvent.click(screen.getByRole('button', { name: /Crear Tarea/i }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveTextContent(/Tarea Clonada/i)
  })
})



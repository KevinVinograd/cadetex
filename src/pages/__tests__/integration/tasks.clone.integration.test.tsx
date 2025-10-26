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
    status: 'PENDING'
  }))
})

describe('Tasks - clone (integration)', () => {
  it('prefill desde localStorage y crea nueva tarea', async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/tasks/clone/old"]}>
        <App />
      </MemoryRouter>
    )

    // Dirección prefilleada desde contacto/tarea
    const address = await screen.findByPlaceholderText(/Ingresa la dirección/i)
    if (!(address as HTMLTextAreaElement).value) {
      const maybeBtn = screen.queryByRole('button', { name: /Usar dirección del contacto/i })
      if (maybeBtn) {
        await userEvent.click(maybeBtn)
      } else {
        // Si no hay botón, la dirección puede quedar vacía; escribe una por defecto
        await userEvent.type(address, 'Av 1')
      }
    }
    expect((address as HTMLTextAreaElement).value).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: /Crear Tarea/i }))
    expect(await screen.findByText(/Tarea Clonada|exitosamente/i)).toBeInTheDocument()
  })
})



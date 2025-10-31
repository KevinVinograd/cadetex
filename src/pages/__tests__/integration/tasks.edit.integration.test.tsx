import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../App'

beforeEach(() => {
  vi.resetModules()
  localStorage.setItem('authToken', 'test')
  localStorage.setItem('userRole', 'orgadmin')
  localStorage.setItem('userEmail', 'a@b.com')
  localStorage.setItem('userOrganizationId', 'org-1')
})

describe('Tasks - edit (integration)', () => {
  it('edita certificado y refresca vista', async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/tasks/task-1"]}>
        <App />
      </MemoryRouter>
    )

    // Esperar a que la tarea se cargue completamente - buscar el botón Editar que aparece después de la carga
    await waitFor(
      async () => {
        await screen.findByRole('button', { name: /Editar/i })
      },
      { timeout: 5000 }
    )
    
    // Ahora buscar el heading con timeout para CI
    await waitFor(
      async () => {
        const heading = await screen.findByRole('heading', { name: /Tarea/i })
        expect(heading).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Entrar en edición
    await userEvent.click(screen.getByRole('button', { name: /Editar/i }))
    await userEvent.click(screen.getByLabelText(/Certificado de Flete/i))

    await userEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }))

    // Mensaje de éxito
    expect(await screen.findByText(/Tarea Actualizada/i)).toBeInTheDocument()
  })
})



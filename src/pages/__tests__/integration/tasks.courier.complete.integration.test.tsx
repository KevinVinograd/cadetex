import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../App'
import { requestLog } from '../../../test/msw/handlers'

beforeEach(() => {
  vi.resetModules()
  localStorage.setItem('authToken', 'test')
  localStorage.setItem('userRole', 'courier')
  localStorage.setItem('userEmail', 'c@d.com')
  localStorage.setItem('userOrganizationId', 'org-1')
})

describe('Courier - finalizar tarea (integration)', () => {
  it('sube foto requerida y finaliza (PATCH status)', async () => {
    render(
      <MemoryRouter initialEntries={["/courier"]}>
        <App />
      </MemoryRouter>
    )

    // Debe listar la tarea confirmada (REF-COURIER)
    await screen.findByText(/Mis Tareas/i)
    const taskCard = await screen.findByText(/REF-COURIER/i)
    expect(taskCard).toBeInTheDocument()

    // Abrir modal de finalizar
    const finalizeButtons = await screen.findAllByRole('button', { name: /Finalizar Tarea/i })
    await userEvent.click(finalizeButtons[0])

    // Subir foto requerida
    const file = new File(['fake'], 'receipt.png', { type: 'image/png' })
    const input = await screen.findByLabelText(/Foto de recibo/i)
    await userEvent.upload(input, file)

    // Completar y finalizar
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: /Finalizar Tarea/i }))

    await waitFor(() => {
      expect(requestLog.updateStatus.length).toBeGreaterThan(0)
    })
    const last = requestLog.updateStatus[requestLog.updateStatus.length - 1]
    expect(last.status).toBe('COMPLETED')
  })
})



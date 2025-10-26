import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../App'
import { requestLog } from '../../../test/msw/handlers'

beforeEach(() => {
  vi.resetModules()
  localStorage.setItem('authToken', 'test')
  localStorage.setItem('userRole', 'orgadmin')
  localStorage.setItem('userEmail', 'a@b.com')
  localStorage.setItem('userOrganizationId', 'org-1')
})

describe('Tasks - create (integration)', () => {
  it('crea tarea con certificados booleanos y contacto cliente', async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/tasks/new"]}>
        <App />
      </MemoryRouter>
    )

    // Completar mínimos
    await userEvent.type(await screen.findByLabelText(/Referencia Vexa/i), 'REF-INTEG-1')
    await userEvent.type(await screen.findByLabelText(/Fecha Programada/i), '2025-12-31')
    await userEvent.type(screen.getByPlaceholderText(/Ingresa la dirección/i), 'Av 1')

    // Seleccionar Cliente 1 (Radix Select usa role=combobox en el trigger)
    await userEvent.click(await screen.findByRole('combobox', { name: /Cliente/i }))
    await userEvent.click(await screen.findByRole('option', { name: /Cliente 1/i }))

    // Tildar certificados
    await userEvent.click(screen.getByLabelText(/Certificado de Flete/i))
    await userEvent.click(screen.getByLabelText(/Certificado FO/i))

    // Crear
    await userEvent.click(screen.getByRole('button', { name: /Crear Tarea/i }))

    // Validar que se haya enviado el POST (MSW)
    await waitFor(() => {
      expect(requestLog.createTask.length).toBeGreaterThan(0)
    })
    const last = requestLog.createTask[requestLog.createTask.length - 1]
    expect(last.freightCert).toBe(true)
    expect(last.foCert).toBe(true)
    expect(last.bunkerCert).toBe(false)
  })
})



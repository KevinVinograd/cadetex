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

    // Esperar a que cargue el formulario
    await screen.findByText(/Información Básica/i)
    
    // Esperar un poco más para que todos los campos estén renderizados
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Completar mínimos - buscar por el texto del label que está visible
    const referenceInput = await screen.findByLabelText(/Reference Vexa/i)
    await userEvent.type(referenceInput, 'REF-INTEG-1')
    
    const dateInput = await screen.findByLabelText(/Fecha Programada/i)
    await userEvent.type(dateInput, '2025-12-31')
    
    const streetInput = await screen.findByPlaceholderText(/Belgrano|Libertador/i)
    await userEvent.type(streetInput, 'Av 1')

    // Seleccionar Cliente 1 (SearchableSelect usa botón con aria-label)
    await userEvent.click(await screen.findByRole('button', { name: /Cliente/i }))
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



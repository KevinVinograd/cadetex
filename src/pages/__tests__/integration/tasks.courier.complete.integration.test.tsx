import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../App'
import { requestLog } from '../../../test/msw/handlers'
import { server } from '../../../test/msw/server'
import { http, HttpResponse } from 'msw'

beforeEach(() => {
  vi.resetModules()
  localStorage.setItem('authToken', 'test')
  localStorage.setItem('userRole', 'courier')
  localStorage.setItem('userEmail', 'c@d.com')
  localStorage.setItem('userOrganizationId', 'org-1')
  // Forzar validación como courier en este test
  server.use(
    http.post('http://localhost:8080/auth/validate', async () => {
      return HttpResponse.json({
        valid: true,
        user: { id: 'user-2', name: 'Courier', email: 'c@d.com', role: 'courier', organizationId: 'org-1' }
      })
    })
  )
})

describe('Courier - finalizar tarea (integration)', () => {
  it('sube foto requerida y finaliza (PATCH status)', async () => {
    render(
      <MemoryRouter initialEntries={["/courier"]}>
        <App />
      </MemoryRouter>
    )

    // Esperar a que cargue la página de courier
    const mt = await screen.findAllByText(/Mis Tareas/i)
    expect(mt.length).toBeGreaterThan(0)
    
    // Esperar a que aparezca la tarea (puede tardar en cargar)
    const taskCard = await screen.findByText(/REF-COURIER/i, {}, { timeout: 10000 })
    expect(taskCard).toBeInTheDocument()

    // Abrir modal de finalizar (botón de tarjeta: "Finalizar")
    const finalizeButtons = await screen.findAllByRole('button', { name: /Finalizar$/i })
    await userEvent.click(finalizeButtons[0])

    // Subir foto requerida
    const file = new File(['fake'], 'receipt.png', { type: 'image/png' })
    const input = await screen.findByTestId('receipt-file')
    await userEvent.upload(input, file)

    // Completar y finalizar
    const dialog = await screen.findByRole('dialog')
    // Mock de fetch para data URLs usadas al subir fotos
    const realFetch = global.fetch
    vi.spyOn(global, 'fetch' as any).mockImplementation((input: any, init?: any) => {
      if (typeof input === 'string' && input.startsWith('data:')) {
        const base64 = input.split(',')[1]
        const binary = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary')
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: 'image/png' })
        return Promise.resolve(new Response(blob))
      }
      return (realFetch as any)(input, init)
    })
    await userEvent.click(within(dialog).getByRole('button', { name: /Finalizar Tarea/i }))

    await waitFor(() => {
      expect(requestLog.updateStatus.length).toBeGreaterThan(0)
    })
    const last = requestLog.updateStatus[requestLog.updateStatus.length - 1]
    expect(last.status).toBe('COMPLETED')
  })
})



import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('/src/hooks/use-auth', () => ({
  useAuth: () => ({ role: 'courier' })
}))

vi.mock('/src/hooks/use-tasks', () => ({
  useTasks: () => ({
    tasks: [
      { id: 't1', referenceNumber: 'REF-XYZ', type: 'DELIVER', priority: 'NORMAL', status: 'CONFIRMED', addressOverride: 'Av 123', clientName: 'Cliente A', photoRequired: true },
    ],
    isLoading: false,
    error: null,
    getTasksByCourier: vi.fn().mockResolvedValue([]),
    updateTaskStatus: vi.fn().mockResolvedValue({ id: 't1', status: 'COMPLETED' }),
  })
}))

async function renderPage() {
  const { default: CourierTasksPage } = await import('../CourierTasksPage')
  return render(
    <MemoryRouter initialEntries={["/courier"]}>
      <Routes>
        <Route path="/courier" element={<CourierTasksPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CourierTasksPage', () => {
  beforeEach(() => vi.resetModules())

  it('muestra tareas y requiere foto para finalizar', async () => {
    await renderPage()

    expect(screen.getByText(/Mis Tareas/i)).toBeInTheDocument()
    expect(screen.getByText(/REF-XYZ/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Finalizar Tarea/i }))
    const modal = await screen.findByRole('dialog', undefined, { timeout: 2000 }).catch(() => null)
    // El finalize modal se monta como overlay simple; si no se detecta role=dialog, seguimos con queries dentro del documento
    // scope not needed after disambiguation of modal button

    // Botón de finalizar deshabilitado hasta que subamos foto (en modal)
    const finalizeButtons = screen.getAllByRole('button', { name: /Finalizar Tarea/i })
    const modalFinalize = finalizeButtons.find(b => b.hasAttribute('disabled'))!
    expect(modalFinalize).toBeDisabled()

    // Subir foto (seleccionar input file dentro del modal)
    const fileInput = (modal ? (modal.querySelector('input[type="file"]') as HTMLInputElement) : (document.body.querySelector('input[type="file"]') as HTMLInputElement))
    const file = new File(['img'], 'recibo.png', { type: 'image/png' })
    await userEvent.upload(fileInput, file)

    // Ahora debe habilitarse
    expect(modalFinalize).toBeEnabled()
    await userEvent.click(modalFinalize)
    // feedback por diálogo
    expect(await screen.findByText(/Tarea Finalizada/i)).toBeInTheDocument()
  })
})



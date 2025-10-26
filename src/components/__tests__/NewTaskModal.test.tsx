import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewTaskModal from '../NewTaskModal'

function renderModal() {
  const onClose = vi.fn()
  const onSuccess = vi.fn()
  render(<NewTaskModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />)
  return { onClose, onSuccess }
}

describe('NewTaskModal', () => {
  it('valida campos requeridos y crea tarea', async () => {
    const { onClose, onSuccess } = renderModal()
    const dialog = await screen.findByRole('dialog')

    // Completar requeridos: Reference BL, Fecha, Dirección
    await userEvent.type(within(dialog).getByLabelText(/Reference BL/i), 'REF-001')
    await userEvent.type(within(dialog).getByLabelText(/Fecha Programada/i), '2025-12-31')
    await userEvent.type(within(dialog).getByLabelText(/Dirección/i), 'Av Siempre Viva 742')

    // Enviar
    await userEvent.click(within(dialog).getByRole('button', { name: /crear tarea/i }))

    // Esperar a que se resuelva el setTimeout de 1s del componente
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    }, { timeout: 10000 })
  }, 15000)

  it('bloquea acciones mientras guarda', async () => {
    renderModal()
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(within(dialog).getByLabelText(/Reference BL/i), 'REF-002')
    await userEvent.type(within(dialog).getByLabelText(/Fecha Programada/i), '2025-12-31')
    await userEvent.type(within(dialog).getByLabelText(/Dirección/i), 'Calle Falsa 123')

    await userEvent.click(within(dialog).getByRole('button', { name: /crear tarea/i }))
    // Botón se deshabilita y muestra "Guardando..."
    expect(within(dialog).getByRole('button', { name: /guardando/i })).toBeDisabled()
  })

  it('muestra error si falla la creación', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const onClose = vi.fn()
    // Forzar throw dentro del try usando onSuccess
    render(<NewTaskModal isOpen={true} onClose={onClose} onSuccess={() => { throw new Error('fail') }} />)
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(within(dialog).getByLabelText(/Reference BL/i), 'REF-ERR')
    await userEvent.type(within(dialog).getByLabelText(/Fecha Programada/i), '2025-12-31')
    await userEvent.type(within(dialog).getByLabelText(/Dirección/i), 'Dir Err')
    await userEvent.click(within(dialog).getByRole('button', { name: /crear tarea/i }))

    await waitFor(() => expect(alertSpy).toHaveBeenCalled())
    alertSpy.mockRestore()
  })
})



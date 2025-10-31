import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../../App'
import { requestLog, db } from '../../../test/msw/handlers'

beforeEach(() => {
  vi.resetModules()
  localStorage.setItem('authToken', 'test')
  localStorage.setItem('userRole', 'orgadmin')
  localStorage.setItem('userEmail', 'a@b.com')
  localStorage.setItem('userOrganizationId', 'org-1')
})

describe('Tasks - eliminar desde Dashboard (integration)', () => {
  it('elimina una tarea y actualiza la lista', async () => {
    // Asegurar que existe 'task-1' inicialmente
    const existed = db.tasks.some(t => t.id === 'task-1')
    expect(existed).toBe(true)

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    )

    // Esperar a que aparezca la tabla con tareas (indica que el dashboard terminó de cargar)
    await waitFor(
      async () => {
        await screen.findByText(/REF-OLD/i)
      },
      { timeout: 5000 }
    )
    
    // Ahora buscar el heading con timeout para CI
    await waitFor(
      async () => {
        const heading = await screen.findByRole('heading', { name: /Dashboard/i })
        expect(heading).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    // Buscar el botón de eliminar (tiene title="Eliminar")
    const deleteButtons = await screen.findAllByTitle(/Eliminar/i)
    // El primer botón es el de la tabla, los otros pueden ser del diálogo
    const tableDeleteButton = deleteButtons.find(btn => btn.getAttribute('title') === 'Eliminar')
    if (tableDeleteButton) {
      await userEvent.click(tableDeleteButton)
    } else {
      await userEvent.click(deleteButtons[0])
    }

    // Confirmar en diálogo
    await userEvent.click(await screen.findByRole('button', { name: /Eliminar$/i }))

    await waitFor(() => {
      expect(requestLog.deleteTask.length).toBeGreaterThan(0)
    })

    const deletedId = requestLog.deleteTask[requestLog.deleteTask.length - 1]
    expect(deletedId).toBeDefined()

    // Validar que ya no esté en la DB simulada
    const stillExists = db.tasks.some(t => t.id === deletedId)
    expect(stillExists).toBe(false)
  })
})



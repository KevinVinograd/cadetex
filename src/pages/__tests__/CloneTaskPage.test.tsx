import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../../contexts/AuthContext'

beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
  // Mock localStorage for auth
  localStorage.setItem('authToken', 'test-token')
  localStorage.setItem('userRole', 'orgadmin')
  localStorage.setItem('userEmail', 'test@example.com')
  localStorage.setItem('userOrganizationId', 'org-1')
})

async function renderPage() {
  const { default: CloneTaskPage } = await import('../CloneTaskPage')
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/dashboard/tasks/clone/old"]}>
        <Routes>
          <Route path="/dashboard/tasks/clone/:id" element={<CloneTaskPage />} />
          <Route path="/dashboard" element={<div>HOME</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('CloneTaskPage (smoke)', () => {
  it('carga datos desde localStorage y confirma con diálogo', async () => {
    localStorage.setItem('clonedTask', JSON.stringify({ referenceBL: 'R-9', type: 'entrega', status: 'en_preparacion', scheduledDate: Date.now(), clientId: 'client-1' }))
    await renderPage()
    const submit = screen.getByRole('button', { name: /crear tarea/i })
    await userEvent.click(submit)
    expect(await screen.findByText(/Tarea Clonada/i)).toBeInTheDocument()
  })
})



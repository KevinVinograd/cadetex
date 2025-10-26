import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

beforeEach(() => vi.resetModules())

describe('Route Guards (smoke)', () => {
  it('ClientsPage: no render si role != orgadmin', async () => {
    vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role: 'courier', organizationId: 'org-1' }) }))
    const { default: ClientsPage } = await import('../ClientsPage')
    render(
      <MemoryRouter initialEntries={["/dashboard/clients"]}>
        <Routes>
          <Route path="/dashboard/clients" element={<ClientsPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.queryByText(/Gestión de Clientes/i)).not.toBeInTheDocument()
  })

  it('UserManagementPage: no render si role != SUPERADMIN', async () => {
    vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role: 'ORGADMIN' }) }))
    const { default: UserManagementPage } = await import('../UserManagementPage')
    render(
      <MemoryRouter initialEntries={["/superadmin/users"]}>
        <Routes>
          <Route path="/superadmin/users" element={<UserManagementPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.queryByText(/Gestión de Usuarios/i)).not.toBeInTheDocument()
  })

  it('SuperAdminPage: no render si role != superadmin', async () => {
    vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role: 'ORGADMIN' }) }))
    vi.doMock('/src/hooks/use-organizations', () => ({
      useOrganizations: () => ({ organizations: [], isLoading: false, error: null })
    }))
    const { default: SuperAdminPage } = await import('../SuperAdminPage')
    render(
      <MemoryRouter initialEntries={["/superadmin"]}>
        <Routes>
          <Route path="/superadmin" element={<SuperAdminPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.queryByText(/Gestión de Organizaciones/i)).not.toBeInTheDocument()
  })
})



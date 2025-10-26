import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

function mockDefaults() {
  vi.doMock('/src/hooks/use-auth', () => ({
    useAuth: () => ({
      isLoading: false,
      role: 'superadmin',
      email: 'admin@test.com',
      organizationId: null,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  }))

  vi.doMock('/src/hooks/use-organizations', () => ({
    useOrganizations: () => ({
      organizations: [
        { id: 'org-1', name: 'Org Uno', createdAt: '', updatedAt: '' },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      createOrganization: vi.fn(),
      updateOrganization: vi.fn(),
      deleteOrganization: vi.fn(),
    }),
  }))

  vi.doMock('/src/hooks/use-users', () => ({
    useUsers: () => ({
      users: [
        { id: 'u1', name: 'Alice', email: 'a@a.com', role: 'ORGADMIN', isActive: true, organizationId: 'org-1', createdAt: '', updatedAt: '' },
        { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'COURIER', isActive: false, organizationId: 'org-1', createdAt: '', updatedAt: '' },
      ],
      isLoading: false,
      error: null,
      getUsersByOrganization: (organizationId: string) => [
        { id: 'u1', name: 'Alice', email: 'a@a.com', role: 'ORGADMIN', isActive: true, organizationId: 'org-1', createdAt: '', updatedAt: '' },
        { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'COURIER', isActive: false, organizationId: 'org-1', createdAt: '', updatedAt: '' },
      ].filter(u => u.organizationId === organizationId),
      refetch: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      getAdminsByOrganization: vi.fn(),
    }),
  }))
}

async function renderWithRoute(path: string) {
  const { default: OrganizationUsersPage } = await import('../OrganizationUsersPage')
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/organization-users/:organizationId" element={<OrganizationUsersPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('OrganizationUsersPage', () => {
  beforeEach(() => {
    vi.resetModules()
    mockDefaults()
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.resetModules()
  })

  it('muestra Not Found cuando la organización no existe', async () => {
    // Remock organizaciones para devolver vacío
    vi.doMock('/src/hooks/use-organizations', () => ({
      useOrganizations: () => ({ organizations: [], isLoading: false, error: null, refetch: vi.fn() })
    }))
    await renderWithRoute('/organization-users/org-inexistente')
    expect(screen.getByText(/Organización no encontrada/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /volver a organizaciones/i })).toBeInTheDocument()
  })

  it('muestra título y filas de usuarios para la organización', async () => {
    await renderWithRoute('/organization-users/org-1')
    expect(screen.getByText(/Usuarios de Org Uno/i)).toBeInTheDocument()
    // Hay 2 usuarios mockeados
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    // Botón de crear usuario presente
    expect(screen.getByRole('button', { name: /crear usuario/i })).toBeInTheDocument()
  })

  it('abre el diálogo de crear usuario al hacer click', async () => {
    await renderWithRoute('/organization-users/org-1')
    await userEvent.click(screen.getByRole('button', { name: /crear usuario/i }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: /crear usuario/i })).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Nombre/i)).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/Correo Electrónico/i)).toBeInTheDocument()
  })

  it('crea un usuario exitosamente', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).fetch = fetchMock
    localStorage.setItem('authToken', 'test-token')

    await renderWithRoute('/organization-users/org-1')
    await userEvent.click(screen.getByRole('button', { name: /crear usuario/i }))
    const dialog = await screen.findByRole('dialog')

    await userEvent.type(within(dialog).getByLabelText(/Nombre/i), 'Carlos Test')
    await userEvent.type(within(dialog).getByLabelText(/Correo Electrónico/i), 'carlos@test.com')
    await userEvent.type(within(dialog).getByLabelText(/Contraseña/i), '12345678')

    // Abrir el Select y seleccionar con teclado para evitar pointer issues
    const roleCombobox = within(dialog).getByRole('combobox')
    roleCombobox.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{Enter}')

    await userEvent.click(within(dialog).getByRole('button', { name: /^crear usuario$/i }))

    expect(await screen.findByText(/Usuario Creado/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('edita un usuario exitosamente', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/users/') && init?.method === 'PUT') {
        return Promise.resolve({ ok: true, json: async () => ({}) })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).fetch = fetchMock
    localStorage.setItem('authToken', 'test-token')

    await renderWithRoute('/organization-users/org-1')
    // Hay varios, tomar el primero
    const editButtons = screen.getAllByTitle('Editar usuario')
    await userEvent.click(editButtons[0])
    const dialog = await screen.findByRole('dialog')

    const nameInput = within(dialog).getByLabelText(/Nombre/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Alice Editada')

    await userEvent.click(within(dialog).getByRole('button', { name: /actualizar usuario/i }))

    expect(await screen.findByText(/Usuario Actualizado/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/'),
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('no renderiza contenido si role != superadmin', async () => {
    vi.resetModules();
    vi.doMock('/src/hooks/use-auth', () => ({
      useAuth: () => ({ isLoading: false, role: 'courier', email: 'c@c.com', organizationId: null, user: null, login: vi.fn(), logout: vi.fn() }),
    }))
    // Volver a mockear los otros hooks necesarios
    vi.doMock('/src/hooks/use-organizations', () => ({
      useOrganizations: () => ({
        organizations: [ { id: 'org-1', name: 'Org Uno', createdAt: '', updatedAt: '' } ],
        isLoading: false, error: null, refetch: vi.fn()
      })
    }))
    vi.doMock('/src/hooks/use-users', () => ({
      useUsers: () => ({
        users: [], isLoading: false, error: null,
        getUsersByOrganization: () => [], refetch: vi.fn(), createUser: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn(), getAdminsByOrganization: vi.fn()
      })
    }))

    const { default: OrganizationUsersPage } = await import('../OrganizationUsersPage')
    render(
      <MemoryRouter initialEntries={["/organization-users/org-1"]}>
        <Routes>
          <Route path="/organization-users/:organizationId" element={<OrganizationUsersPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.queryByText(/Usuarios de/i)).not.toBeInTheDocument()
  })
})



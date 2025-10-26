import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

function mockAuth(loginImpl: (email: string, password: string) => Promise<any>) {
  vi.doMock('/src/hooks/use-auth', () => ({
    useAuth: () => ({
      isLoading: false,
      role: null,
      email: null,
      organizationId: null,
      user: null,
      login: loginImpl,
      logout: vi.fn(),
    }),
  }))
}

async function renderLogin() {
  const { default: LoginPage } = await import('../LoginPage')
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/superadmin" element={<div>SUPERADMIN</div>} />
        <Route path="/courier" element={<div>COURIER</div>} />
        <Route path="/dashboard" element={<div>DASHBOARD</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('redirige a /superadmin cuando el rol es SUPERADMIN', async () => {
    mockAuth(async () => ({ user: { role: 'SUPERADMIN', email: 'a@a.com' } }))
    await renderLogin()

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'a@a.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), '123456')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('SUPERADMIN')).toBeInTheDocument()
  })

  it('redirige a /courier cuando el rol es COURIER', async () => {
    mockAuth(async () => ({ user: { role: 'COURIER', email: 'c@a.com' } }))
    await renderLogin()

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'c@a.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), '123456')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('COURIER')).toBeInTheDocument()
  })

  it('redirige a /dashboard para otros roles', async () => {
    mockAuth(async () => ({ user: { role: 'ORGADMIN', email: 'o@a.com' } }))
    await renderLogin()

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'o@a.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), '123456')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText('DASHBOARD')).toBeInTheDocument()
  })

  it('muestra error cuando login falla', async () => {
    mockAuth(async () => { throw new Error('invalid') })
    await renderLogin()

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'x@x.com')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'bad')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(await screen.findByText(/Correo electrónico o contraseña inválidos/i)).toBeInTheDocument()
  })
})



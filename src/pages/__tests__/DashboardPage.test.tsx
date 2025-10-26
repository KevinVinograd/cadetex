import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

beforeEach(() => vi.resetModules())

describe('DashboardPage (smoke)', () => {
  it('renderiza Dashboard', async () => {
    vi.doMock('/src/hooks/use-auth', () => ({ useAuth: () => ({ role: 'orgadmin', organizationId: 'org-1' }) }))
    vi.doMock('/src/hooks/use-tasks', () => ({
      useTasks: () => ({
        tasks: [],
        isLoading: false,
        error: null,
        getTasksByOrganization: vi.fn().mockResolvedValue([]),
      })
    }))
    const { default: DashboardPage } = await import('../DashboardPage')
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeInTheDocument()
  })
})



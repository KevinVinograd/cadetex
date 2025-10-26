import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('renders with text and responds to click', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Enviar</Button>)

    const btn = screen.getByRole('button', { name: /enviar/i })
    expect(btn).toBeInTheDocument()

    await userEvent.click(btn)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})



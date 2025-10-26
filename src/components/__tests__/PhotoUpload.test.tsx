import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PhotoUpload } from '../photo-upload'

function file(name: string, type = 'image/png', content = 'hello') {
  return new File([content], name, { type })
}

describe('PhotoUpload', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('permite subir, previsualizar y remover foto', async () => {
    const onPhotoUpload = vi.fn()
    const onPhotoRemove = vi.fn()
    render(<PhotoUpload onPhotoUpload={onPhotoUpload} onPhotoRemove={onPhotoRemove} isRequired />)

    const fileInput = screen.getByRole('button', { name: /seleccionar foto/i })
    await userEvent.click(fileInput)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file('recibo.png'))

    expect(onPhotoUpload).toHaveBeenCalled()
    expect(await screen.findByAltText(/preview/i)).toBeInTheDocument()

    const remove = screen.getByRole('button', { name: /quitar foto/i })
    await userEvent.click(remove)
    expect(onPhotoRemove).toHaveBeenCalled()
  })
})

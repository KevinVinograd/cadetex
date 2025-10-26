import '@testing-library/jest-dom'
import { vi, beforeAll, afterEach, afterAll, beforeEach } from 'vitest'
import { server } from './test/msw/server'

// Polyfills or global mocks can be added here when needed.
// Example: ResizeObserver for components relying on measurements.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Assign mock only if not present in jsdom
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ro: any = (globalThis as any).ResizeObserver
if (typeof ro === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}

// Radix UI expects pointer APIs present; jsdom no-ops are fine for tests
if (typeof (window as any).PointerEvent === 'undefined') {
  ;(window as any).PointerEvent = class PointerEvent extends Event {}
}
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false
}
if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = () => {}
}
if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = () => {}
}

// scrollIntoView is used by Radix Select; noop it in JSDOM
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// matchMedia polyfill for ThemeProvider in tests
if (!(window as any).matchMedia) {
  ;(window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// Stub browser alerts in JSDOM
// @ts-ignore
window.alert = window.alert || (() => {})

// Silence noisy console output during tests
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'info').mockImplementation(() => {})
  vi.spyOn(console, 'debug').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  if (process.env.QUIET_TESTS) {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  }
})

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: (process.env.QUIET_TESTS ? 'bypass' : 'error') }))
afterEach(() => {
  server.resetHandlers()
  vi.restoreAllMocks()
})
afterAll(() => server.close())



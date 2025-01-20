import { vi } from 'vitest'

export const MOCK_OBJECT = { foo: 'bar' }
export const MOCK_TEXT = 'FooBarBaz'

type SpyFn = (request: Request) => any

export const createFetchSpy = (...spies: SpyFn[]) => {
  return vi.fn((request: Request) => {
    const results = spies.map(spy => spy(request))
    // Return the last spy result or a default response
    return Promise.resolve(new Response(JSON.stringify(MOCK_OBJECT), {
      headers: { 'content-type': 'application/json' }
    }))
  })
}

export const createRequestSpy = () => {
  return {
    url: vi.fn(),
    method: vi.fn(),
    headers: vi.fn(),
    body: vi.fn(),
    request: vi.fn(),
  }
}

export const methodTests = [
  { method: 'get', hasBody: false },
  { method: 'post', hasBody: true },
  { method: 'put', hasBody: true },
  { method: 'patch', hasBody: true },
  { method: 'delete', hasBody: true },
] 
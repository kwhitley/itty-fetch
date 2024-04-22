import { describe, expect, it, vi } from 'vitest'
import { fetcher } from './fetcher'

describe('fetcher', () => {
  it('fetcher.post() => calling post with id = 3', async () => {
    const fetch = vi.fn(v => v)
    await fetcher({ fetch }).post()
    expect(fetch).toHaveReturnedWith('')
  })

  it('fetcher(options).post() => will call fetcher with options', async () => {
    const fetch = vi.fn((_, options) => options)
    await fetcher({ fetch, id: 3 }).post()
    expect(fetch).toHaveReturnedWith({ id: 3 })
  })

  it('fetcher(options1).post(options2) => will call fetcher with options2', async () => {
    const fetch = vi.fn((_, options) => options)
    await fetcher({ fetch }).post(null, { id: 3 })
    expect(fetch).toHaveReturnedWith({ id: 3 })
  })

  it('fetcher(options1).post(options2) => will blend options', async () => {
    const fetch = vi.fn((_, options) => options)
    await fetcher({ fetch, foo: 'bar' }).post(null, { id: 3 })
    expect(fetch).toHaveReturnedWith({ foo: 'bar', id: 3 })
  })
})

import { describe, expect, it, vi } from 'vitest'
import { fetcher } from './fetcher'

describe('fetcher', () => {
  it('fetcher.post() => calling post with id = 3', async () => {
    const fetch = vi.fn(v => v)
    await fetcher({ fetch }).post()
    expect(fetch).toHaveReturnedWith('')
  })
  // it('fetcher.id => 3', () => {
  //   expect(fetcher.id).toBe(3)
  // })
  // it('fetcher({ id: 4 }).id => 4', () => {
  //   expect(fetcher({ id: 4 }).id).toBe(4)
  // })
})

import { describe, expect, it, vi } from 'vitest'
import { fetcher } from './fetcher'

const OBJECT = { foo: 'bar' }
const STRINGIFIED_OBJECT = JSON.stringify(OBJECT)

const fetch = (spy) => (request) => {
  spy(request)

  return Promise.resolve(new Response(STRINGIFIED_OBJECT))
}

describe('fetcher', () => {
  it('fetcher.post() => calls a request with method POST', async () => {
    const spy = vi.fn(r => r.method)

    const response = await fetcher({ fetch: fetch(spy) }).post()
    expect(spy).toHaveReturnedWith('POST')
    expect(response).toEqual(OBJECT)
  })

  it('fetcher({ base }).get() => prepends base to path', async () => {
    const spy = vi.fn(r => r.url)

    await fetcher({ base: 'https:foo.bar', fetch: fetch(spy) }).post()
    expect(spy).toHaveReturnedWith('https://foo.bar/')
  })

  it('fetcher({ headers: {} }).get() => appends headers to request', async () => {
    const spy = vi.fn(r => r.headers.get('foo'))

    await fetcher({
      base: 'https:foo.bar',
      fetch: fetch(spy),
      headers: { foo: 'bar' },
    }).get('/cats')
    expect(spy).toHaveReturnedWith('bar')
  })

  it('fetcher({ headers: {} }).get() => appends headers to request', async () => {
    const spy = vi.fn(r => [...r.headers.entries()])
    const headers = new Headers()
    headers.append('foo', 'bar')

    await fetcher({
      base: 'https:foo.bar',
      fetch: fetch(spy),
      headers,
    }).get('/cats')
    expect(spy).toHaveReturnedWith([
      ['foo', 'bar']
    ])
  })

  it('fetcher({ headers }).get({ headers }) => blends base headers with final ones', async () => {
    const spy = vi.fn(r => [...r.headers.entries()])
    const headers = new Headers()
    headers.append('foo', 'bar')

    await fetcher({
      base: 'https:foo.bar',
      fetch: fetch(spy),
      headers: { foo: 'bar', cat: 'dog' },
    }).get('/cats', null, {
      headers: { foo: 'baz' }
    })
    expect(spy).toHaveReturnedWith([
      ['cat', 'dog'],
      ['foo', 'baz'],
    ])
  })

  // it('fetcher(options).post() => will call fetcher with options', async () => {
  //   const fetch = vi.fn((_, options) => options)
  //   await fetcher({ fetch, id: 3 }).post()
  //   expect(fetch).toHaveReturnedWith({ id: 3 })
  // })

  // it('fetcher(options1).post(options2) => will call fetcher with options2', async () => {
  //   const fetch = vi.fn((_, options) => options)
  //   await fetcher({ fetch }).post(null, { id: 3 })
  //   expect(fetch).toHaveReturnedWith({ id: 3 })
  // })

  // it('fetcher(options1).post(options2) => will blend options', async () => {
  //   const fetch = vi.fn((_, options) => options)
  //   await fetcher({ fetch, foo: 'bar' }).post(null, { id: 3 })
  //   expect(fetch).toHaveReturnedWith({ foo: 'bar', id: 3 })
  // })
})

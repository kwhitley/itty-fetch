import { describe, expect, it, vi } from 'vitest'
import { fetcher } from './fetcher'

const OBJECT = { foo: 'bar' }
const STRINGIFIED_OBJECT = JSON.stringify(OBJECT)
const TEXT = 'FooBarBaz'

const fetch = (spy) => (request) => {
  spy(request)

  return Promise.resolve(new Response(STRINGIFIED_OBJECT, {
    headers: { 'content-type': 'application/json' }
  }))
}

const fetchText = (spy) => (request) => {
  spy(request)

  return Promise.resolve(new Response(TEXT))
}

describe('fetcher', () => {
  it('fetcher.post() => calls a request with method POST', async () => {
    const spy = vi.fn(r => r.method)

    const response = await fetcher({ fetch: fetch(spy) }).post(OBJECT)
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
      base: 'https://foo.bar',
      fetch: fetch(spy),
      headers: { foo: 'bar' },
    }).get('/cats')
    expect(spy).toHaveReturnedWith('bar')
  })

  it('fetcher({ query: {} }).get({ query: {} }) => appends query to request', async () => {
    const spy = vi.fn(r => {
      let url = new URL(r.url)

      return Object.fromEntries(url.searchParams.entries())
    })

    await fetcher({
      base: 'https://foo.bar?foo=bar',
      fetch: fetch(spy),
    }).get({ query: { page: 2 }})
    expect(spy).toHaveReturnedWith({ foo: 'bar', page: '2' })
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
    }).get('/cats', {
      headers: { foo: 'baz' }
    })
    expect(spy).toHaveReturnedWith([
      ['cat', 'dog'],
      ['foo', 'baz'],
    ])
  })

  it('fetcher({ headers }).get({ headers }) => blends base headers with final ones', async () => {
    const spy = vi.fn(r => r.url)

    await fetcher({
      base: 'https:foo.bar',
      fetch: fetch(spy),
    }).get()
    expect(spy).toHaveReturnedWith('https://foo.bar/')
  })

  it('fetcher({ headers }).get({ headers }) => blends base headers with final ones', async () => {
    const spy = vi.fn(async r => await r.json())

    await fetcher({
      base: 'https:foo.bar',
      fetch: fetch(spy),
    }).post(OBJECT)
    expect(spy).toHaveReturnedWith(OBJECT)
  })
})

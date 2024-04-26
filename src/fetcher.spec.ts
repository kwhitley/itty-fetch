import { describe, expect, it, vi } from 'vitest'
import { fetcher } from './fetcher'

const OBJECT = { foo: 'bar' }
const STRINGIFIED_OBJECT = JSON.stringify(OBJECT)
const TEXT = 'FooBarBaz'

const SCENARIOS = [
  {
    label: 'can set headers using object notation on fetcher()',
    args1: [{ headers: { foo: 'bar' }}],

  }
]

const withSpies = (...spies) => (request) => {
  for (const spy of spies) {
    spy(request)
  }

  return Promise.resolve(new Response(STRINGIFIED_OBJECT, {
    headers: { 'content-type': 'application/json' }
  }))
}

const return404 = (request) =>
  Promise.resolve(new Response(null, { status: 404 }))

const return404WithBody = (request) =>
  Promise.resolve(new Response(JSON.stringify({ status: 404, error: 'Are you sure about that?' }), {
    headers: { 'content-type': 'application/json' },
    status: 404,
  }))

const fetchText = (spy) => (request) => {
  spy(request)

  return Promise.resolve(new Response(TEXT))
}

describe('fetcher', () => {
  it('fetcher.post() => calls a request with method POST', async () => {
    const spy = vi.fn(r => r.method)

    const response = await fetcher({ fetch: withSpies(spy) }).post(OBJECT)
    expect(spy).toHaveReturnedWith('POST')
    expect(response).toEqual(OBJECT)
  })

  it('fetcher({ base }).get() => prepends base to path', async () => {
    const spy = vi.fn(r => r.url)

    await fetcher({ base: 'https:foo.bar', fetch: withSpies(spy) }).post()
    expect(spy).toHaveReturnedWith('https://foo.bar/')
  })

  it('fetcher({ headers: {} }).get() => appends headers to request', async () => {
    const spy = vi.fn(r => r.headers.get('foo'))

    await fetcher({
      base: 'https://foo.bar',
      fetch: withSpies(spy),
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
      fetch: withSpies(spy),
    }).get({ query: { page: 2 }})
    expect(spy).toHaveReturnedWith({ foo: 'bar', page: '2' })
  })

  it('fetcher({ headers: {} }).get() => appends headers to request', async () => {
    const spy = vi.fn(r => [...r.headers.entries()])
    const headers = new Headers()
    headers.append('foo', 'bar')

    await fetcher({
      base: 'https:foo.bar',
      fetch: withSpies(spy),
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
      fetch: withSpies(spy),
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
      fetch: withSpies(spy),
    }).get()
    expect(spy).toHaveReturnedWith('https://foo.bar/')
  })

  it('fetcher({ headers }).get({ headers }) => blends base headers with final ones', async () => {
    const spy = vi.fn(async r => await r.json())

    await fetcher({
      base: 'https:foo.bar',
      fetch: withSpies(spy),
    }).post(OBJECT)
    expect(spy).toHaveReturnedWith(OBJECT)
  })

  describe('BEHAVIOR', () => {
    describe('errors', () => {
      it('can catch an error, when thrown', async () => {
        const uncaught = async () => await fetcher({ fetch: return404 }).get('/hey')
        const caught = async () => await fetcher({ fetch: return404 }).get('/hey').catch(() => {})

        const throws = async () => {
          throw new Error('bad stuff')
        }

        const doesntThrow = async () => await 5

        expect(throws).rejects.toThrow()
        expect(uncaught).rejects.toThrow()
        expect(caught).not.toThrow()
        expect(doesntThrow).not.toThrow()
      })
    })
  })
})

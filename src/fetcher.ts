type ResponseHandler = (response?: Response, request?: Request) => Promise<Response | void>

type FetcherOptions = {
  base?: string | URL
  fetch?: Function
  parse?: boolean
  encode?: boolean
  after?: ResponseHandler[]
} & RequestInit & Record<string, any>

type GetFetchCall = {
  (url?: string, options?: FetcherOptions): Promise<any>
  (options?: FetcherOptions): Promise<any>
}

type FetchCall = {
  (url?: string, payload?: any, options?: FetcherOptions): Promise<any>
  (payload?: any, options?: FetcherOptions): Promise<any>
}

type Fetcher = {
  (options?: FetcherOptions): Fetcher
  get: GetFetchCall
  post: FetchCall
  put: FetchCall
  patch: FetchCall
  delete: FetchCall
}

const createEnhancedFunction = ({
  base = window?.location?.origin ?? '',
  fetch = () => {},
  headers = {},
  ...options
}: FetcherOptions = {}): Fetcher => new Proxy((o: any) => createEnhancedFunction(o), {
  get(obj: any, method: any) {
    return obj[method]
      ?? (
        async (...args: any) => {
          // extract base
          base = new URL(base + (
            typeof args[0] == 'string'
              ? args.shift()
              : ''
          ))

          // extract payload
          if (method != 'get')
            var payload = args.shift()

          // set method on request
          options.method = method

          // created blended options
          options = { ...options, ...args.shift() }

          // turn base headers into actual headers instance
          headers = new Headers(headers)

          const {
            parse = true,
            encode = true,
            after = [],
          } = options as FetcherOptions

          if (payload && encode) {
            if (typeof payload != 'string') {
              payload = JSON.stringify(payload)
              headers.set('content-type', 'application/json')
            }
            options.body = payload
          }

          // create request
          const request = new Request(base, options)

          // append any headers
          for (const [key, value] of [...new Headers(headers).entries(), ...request.headers.entries()]) {
            request.headers.set(key, value)
          }

          let response = await fetch(request)

          // result = await result.then((r: Response) => {
          if (!response.ok) {
            const err = new Error(response.statusText)
            // @ts-ignore
            err.status = r.status
            throw err
          }

          if (parse) {
            response = await (response.headers.get('content-type')?.includes('json')
              ? response.json()
              : response.text()
            )
          }

          for (const handler of after) {
            response = await handler(response, request) ?? response
          }

          return response
        }
      )
  }
})

export const fetcher = createEnhancedFunction()


// fetcher({
//   after: [
//     (r => r.json())
//   ]
// }).get()

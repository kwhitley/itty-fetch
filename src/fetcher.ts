type ResponseHandler = (response?: Response, request?: Request) => Promise<Response | void>

type FetcherOptions = {
  base?: string | URL
  fetch?: typeof fetch
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
  headers = {},
  ...options
}: FetcherOptions = {}): Fetcher => new Proxy((o: any) => createEnhancedFunction(o), {
  get(obj: any, method: any) {
    return obj[method]
      ?? (
        async (...args: any) => {
          // extract base
          let childBase = typeof args[0] == 'string'
          ? args.shift()
          : ''
          var url = new URL(childBase.indexOf('http') == -1 ? base + childBase : childBase)

          // extract payload
          if (method != 'get')
            var payload = args.shift()

          // created locally-scoped blended options
          options = { ...options, ...args.shift(), method }

          // turn base headers into actual headers instance
          headers = new Headers(headers)

          const {
            parse = true,
            encode = true,
            onError,
            after = [],
            query = {},
          } = options as FetcherOptions

          // @ts-ignore
          Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, v))

          if (payload && encode) {
            if (typeof payload != 'string') {
              payload = JSON.stringify(payload)
              headers.set('content-type', 'application/json')
            }
            options.body = payload
          }

          // create request
          var request = new Request(url, options)

          // append any headers
          for (const [key, value] of [...new Headers(headers).entries(), ...request.headers.entries()]) {
            request.headers.set(key, value)
          }

          var error, response = await (options.fetch ?? fetch)(request)

          // throw on error
          if (!response.ok) {
            error = new Error(response.statusText)
            // @ts-ignore
            error.status = response.status
            // throw error
          }

          if (parse) {
            response = await (response.headers.get('content-type')?.includes('json')
              ? response.json()
              : response.text()
            )
          }

          if (error) {
            if (onError)
              return await onError(error, response)
            else
              throw error
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

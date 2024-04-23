type Options = {
  base?: string
  fetch?: Function
  headers?: Headers | Record<string, any>
}

type FetchCallOptions = {
  parse?: false | Function
  encode?: false | Function
  body?: any
} & RequestInit

type FetchCall = (url: string, payload: any, options: FetchCallOptions) => Promise<any>

const createEnhancedFunction = ({
  base = window?.location?.origin ?? '',
  fetch = () => {},
  headers = {},
  ...options
}: Options = {}) => new Proxy((o: any) => createEnhancedFunction(o), {
  get(obj: any, method: any) {
    return obj[method]
      ?? (
        (...args: any): FetchCall => {
          // extract base
          base = base + (
            typeof args[0] == 'string'
              ? args.shift()
              : ''
          )

          // extract payload
          let payload = args.shift()

          options.method = method


          // created blended options
          options = { ...options, ...args.shift() }

          // turn base headers into actual headers instance
          // headers = new Headers(headers)

          const {
            parse = (r: any) => r.json(),
            // encode = JSON.stringify,
          } = options as FetchCallOptions

          if (payload) {
            if (typeof payload != 'string') {
              payload = JSON.stringify(payload)
              headers.set('content-type', 'application/json')
            }
            options.body = payload
          }

          // create request
          const request = new Request(base, options)

          // add base
          // for (const [key, value] of headers.entries()) {
          //   request.headers.set(key, value)
          // }

          // append any headers
          for (const [key, value] of [...new Headers(headers).entries(), ...request.headers.entries()]) {
            request.headers.set(key, value)
          }

          // console.log('request headers are', [...request.headers.entries()])

          let fetchCall = fetch(request)

          if (parse) {
            fetchCall = fetchCall.then(parse)
          }

          return fetchCall
        }
      )
  }
})

export const fetcher = createEnhancedFunction()


// fetcher({ base: 'test' })

type ResponseHandler = (response?: Response, request?: Request) => Promise<Response | void>

// Update FetcherOptions to be more specific about what it accepts
type FetcherOptionsObject = {
  base?: string | URL
  fetch?: typeof fetch
  parse?: boolean
  encode?: boolean
  after?: ResponseHandler[]
} & RequestInit & Record<string, any>

// Create a union type for all possible arguments
type FetcherOptions = string | FetcherOptionsObject

type GetFetchCall = {
  (url?: string, options?: FetcherOptionsObject): Promise<any>
  (options?: FetcherOptionsObject): Promise<any>
}

type FetchCall = {
  (url?: string, payload?: any, options?: FetcherOptionsObject): Promise<any>
  (payload?: any, options?: FetcherOptionsObject): Promise<any>
}

type Fetcher = {
  (options?: FetcherOptions, additionalOptions?: FetcherOptionsObject): Fetcher
  get: GetFetchCall
  post: FetchCall
  put: FetchCall
  patch: FetchCall
  delete: FetchCall
}

// Extract handler logic for better minification
const handleRequest = async (
  method: string, 
  args: any[], 
  options: FetcherOptionsObject, 
  base: string, 
  headers: HeadersInit
) => {
  // console.log({ method, args, options, base, headers })
  let childBase = typeof args[0] == 'string' ? args.shift() : ''
  let payload = method != 'get' ? args.shift() : null
  
  options = { ...options, ...args.shift(), method }
  headers = new Headers(headers)
  // console.log('base headers', Object.fromEntries(headers))
  // console.log('request headers', Object.fromEntries(new Headers(options.headers ?? [])))
  let url = new URL(childBase.indexOf('http') == -1 ? base + childBase : childBase)

  // @ts-ignore - combine query params
  Object.entries(options.query || {}).forEach(([k, v]) => url.searchParams.append(k, v))

  // Handle payload
  if (payload && options.encode !== false) {
    options.body = typeof payload == 'string' ? payload : JSON.stringify(payload)
    // @ts-ignore - set content-type
    !typeof payload == 'string' && headers.set('content-type', 'application/json')
  }

  for (let [k, v] of [...new Headers(options.headers ?? [])]) {
    headers.set(k, v)
  }
  options.headers = headers
  let request = new Request(url, options)
  // console.log({ request, options})
  // console.log('final headers', Object.fromEntries(options.headers))

  let error, response = await (options.fetch ?? fetch)(request)

  if (!response.ok) {
    error = Object.assign(new Error(response.statusText), { status: response.status })
  }

  options.parse !== false && (response = await (response.headers.get('content-type')?.includes('json')
    ? response.json()
    : response.text()))

  if (error) return options.onError ? options.onError(error, response) : Promise.reject(error)

  for (let handler of options.after || []) {
    response = await handler(response, request) ?? response
  }

  return response
}

const createEnhancedFunction = (
  optionsOrBase?: FetcherOptions, 
  additionalOptions?: FetcherOptionsObject,
  options = typeof optionsOrBase == 'string'
    ? { base: optionsOrBase, ...additionalOptions }
    : optionsOrBase || {},
  { 
    base = window?.location?.origin ?? '', 
    headers = {}, 
    ...restOptions 
  } = options
): Fetcher =>
  // @ts-ignore
  new Proxy((...args: any) => createEnhancedFunction(...args), {
    // @ts-ignore
    get: (obj, method: any) => obj[method] ?? ((...args) => handleRequest(method, args, restOptions, base, headers))
  })

export const fetcher = createEnhancedFunction()
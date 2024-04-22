type Options = {
  base?: string
  fetch?: Function
}

const createEnhancedFunction = ({
  base = '',
  fetch = () => {},
  ...other
}: Options = {}) => new Proxy((o: any) => createEnhancedFunction(o), {
  get(obj: any, prop: any) {
    return obj[prop]
      ?? (
        (...args: any) => {
          // extract base
          base = base + (
            typeof args[0] == 'string'
              ? args.shift()
              : ''
          )

          const payload = args.shift(),
                options = args.shift()

          return fetch(base, {
            ...other,
            ...options,
          })
        }
      )
  }
})

export const fetcher = createEnhancedFunction()

type Options = {
  base?: string
  fetch?: Function
}

const createEnhancedFunction = ({
  base = '',
  fetch = () => {},
}: Options = {}) => new Proxy((o: any) => createEnhancedFunction(o), {
  get(obj: any, prop: any) {
    return obj[prop]
      ?? (
        (...args: any) => {
          // console.log('calling method', prop, 'with args', args)
          // console.log('typeof args[0]', typeof args[0])
          base = base + (
            typeof args[0] == 'string'
              ? args.shift()
              : ''
          )
          // console.log({
          //   base,
          //   fetch,
          // })
          return fetch(base, ...args)
        }
      )
  }
})

export const fetcher = createEnhancedFunction()

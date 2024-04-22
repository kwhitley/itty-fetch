type Options = {
  id?: number
}

function createEnhancedFunction(options: Options = {
  id: 3,
}) {
  // const baseFunction = (newId: any) => createEnhancedFunction(newId)
  // baseFunction.$ = options
  // Object.assign(baseFunction, options)

  return new Proxy((o: any) => createEnhancedFunction(o), {
    // get(obj: any, prop: any) {
    //   return obj[prop] ?? (() => `calling "${prop}" with id = ${obj.id}`)
    // },
    get(obj: any, prop: any) {
      return obj[prop] ?? ((opt = options) => `calling "${prop}" with id = ${opt.id}`)
    }
  })
}

export const proxy = createEnhancedFunction()

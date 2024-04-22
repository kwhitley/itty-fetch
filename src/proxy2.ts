function createEnhancedFunction(options = 3) {
  const baseFunction = (newId: any) => createEnhancedFunction(newId)
  baseFunction.$ = options

  return new Proxy(baseFunction, {
    // get(obj: any, prop: any) {
    //   return obj[prop] ?? (() => `calling "${prop}" with id = ${obj.id}`)
    // },
    get(obj: any, prop: any) {
      return obj[prop] ?? (() => `calling "${prop}" with id = ${obj.$}`)
    }
  })
}

export const proxy = createEnhancedFunction()

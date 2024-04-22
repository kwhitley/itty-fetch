import { describe, expect, it } from 'vitest'
import { proxy as proxy1 } from './proxy1'
// import { proxy as proxy2 } from './proxy2'

const functions = { proxy1 }

for (const [name, fn] of Object.entries(functions)) {
  describe('proxy tests: ' + name, () => {
    it('fn.post() => calling post with id = 3', () => {
      expect(fn.post()).toBe(`calling "post" with id = 3`)
    })
    it('fn({ id: 4 }).post() => calling post with id = 4', () => {
      expect(fn({ id: 4 }).post()).toBe(`calling "post" with id = 4`)
    })
    it('fn({ id: 5 }).puppy() => calling post with id = 5', () => {
      expect(fn({ id: 5 }).puppy()).toBe(`calling "puppy" with id = 5`)
    })
    it('fn({ id: 5 }).puppy({ id: 6 }) => calling post with id = 6', () => {
      expect(fn({ id: 5 }).puppy({ id: 6 })).toBe(`calling "puppy" with id = 6`)
    })
    // it('fn.id => 3', () => {
    //   expect(fn.id).toBe(3)
    // })
    // it('fn({ id: 4 }).id => 4', () => {
    //   expect(fn({ id: 4 }).id).toBe(4)
    // })
  })
}

console.log(proxy1.post())         // Calling "post" with id = 3
console.log(proxy1(4).post())      // Calling "post" with id = 4
console.log(proxy1(5).puppy())     // Calling "puppy" with id = 5
console.log(proxy1.$)             // 3
console.log(proxy1(4).$)          // 4

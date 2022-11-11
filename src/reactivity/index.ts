let activeEffect: Function | null

export class Ref<T> {
  #value: T
  #subscribers: Set<Function> = new Set()

  constructor(value: T) {
    this.#value = value
  }

  get value() {
    this.#depend()
    return this.#value
  }

  set value(newVal: T) {
    this.#value = newVal
    this.#notify()
  }

  #depend() {
    if (activeEffect) {
      this.#subscribers.add(activeEffect!)
    }
  }

  #notify() {
    this.#subscribers.forEach((sub) => {
      sub()
    })
  }
}

export function watchEffect(effect: () => void) {
  activeEffect = effect
  activeEffect()
  activeEffect = null
}

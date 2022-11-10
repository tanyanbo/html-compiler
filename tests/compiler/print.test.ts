import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest"
import { MyNode } from "../../src/compiler"

describe("node print function", () => {
  let spy: MockInstance

  beforeEach(() => {
    spy = vi.spyOn(console, "log")
  })

  it("should print when print is called", () => {
    const node = new MyNode("div")
    node.print()
    expect(spy).toHaveBeenCalledOnce()
  })

  it("should print with correct indentation for a single element", () => {
    const node = new MyNode("div")
    node.print()
    expect(spy).toBeCalledWith("div")
  })

  it("should print twice for a single element with one child element", () => {
    const node = new MyNode("div", [new MyNode("p")])
    node.print()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it("should print with correct indentation for a single element with one child element", () => {
    const node = new MyNode("div", [new MyNode("p")])
    node.print()
    expect(spy).toHaveBeenNthCalledWith(1, "div")
    expect(spy).toHaveBeenNthCalledWith(2, "  p")
  })

  it("should print 3 times for a single element with one child element with text as its child", () => {
    const node = new MyNode("div", [new MyNode("p", ["aaa"])])
    node.print()
    expect(spy).toBeCalledTimes(3)
  })

  it("should print with correct indentation for a single element with one child element with text as its child", () => {
    const node = new MyNode("div", [new MyNode("p", ["aaa"])])
    node.print()
    expect(spy).toHaveBeenNthCalledWith(1, "div")
    expect(spy).toHaveBeenNthCalledWith(2, "  p")
    expect(spy).toHaveBeenNthCalledWith(3, "    aaa")
  })
})

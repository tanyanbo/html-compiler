import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest"
import { compileHtml, MyNode } from ".."

describe("html compiler", () => {
  it("compilation result should be an array", () => {
    const html = "<div></div>"
    const res = compileHtml(html)
    expect(Array.isArray(res)).toBe(true)
  })

  it("one root element should compile to one object", () => {
    const html = "<div></div>"
    const res = compileHtml(html)
    expect(res).toHaveLength(1)
  })

  it("three root elements should compile to three objects in the result array", () => {
    const html = "<div></div><p></p><h1></h1>"
    const res = compileHtml(html)
    expect(res).toHaveLength(3)
  })

  it("three root elements (some with children) should compile to three objects in the result array", () => {
    const html = "<div></div><p><span>test</span></p><h1></h1>"
    const res = compileHtml(html)
    expect(res).toHaveLength(3)
  })

  it("one element should compile to one object of type MyNode", () => {
    const html = "<div></div>"
    const res = compileHtml(html)
    expect(res[0] instanceof MyNode).toBe(true)
  })

  it("should compile one element with no children and attributes correctly", () => {
    const html = "<div></div>"
    const res = compileHtml(html)
    expect(res).toEqual([new MyNode("div")])
  })

  it("should compile one element with text as children correctly", () => {
    const html = "<p>testing</p>"
    const res = compileHtml(html)
    expect(res).toEqual([new MyNode("p", ["testing"])])
  })

  it("should compile multiline html correctly", () => {
    const html = `
      <div>
        testing
      </div>
    `
    const res = compileHtml(html)
    expect(res).toEqual([new MyNode("div", ["testing"])])
  })

  it("should compile one element with both text and element children correctly", () => {
    const html = `
    <p>
      aaa
      <span>testing</span>
    </p>
    `
    const res = compileHtml(html)
    expect(res).toEqual([
      new MyNode("p", ["aaa", new MyNode("span", ["testing"])]),
    ])
  })

  it("should compile nested elements correctly", () => {
    const html = `
      <div>
        testing
        <p>
          <span>bbb</span>
        </p>
      </div>
    `
    const res = compileHtml(html)
    expect(res).toEqual([
      new MyNode("div", [
        "testing",
        new MyNode("p", [new MyNode("span", ["bbb"])]),
      ]),
    ])
  })

  it("should compile non-boolean props correctly", () => {
    const html = "<p id='para'></p>"
    const res = compileHtml(html)
    expect(res).toEqual([new MyNode("p", [], { id: "para" })])
  })

  it("should compile boolean props correctly", () => {
    const html = "<button disabled>aaa</button>"
    const res = compileHtml(html)
    expect(res).toEqual([new MyNode("button", ["aaa"], { disabled: "true" })])
  })

  it("should compile boolean props and non-boolean props correctly (non-boolean prop first)", () => {
    const html = "<button class='btn' disabled>aaa</button>"
    const res = compileHtml(html)
    expect(res).toEqual([
      new MyNode("button", ["aaa"], { disabled: "true", class: "btn" }),
    ])
  })

  it("should compile boolean props and non-boolean props correctly (boolean prop first)", () => {
    const html = "<button disabled class='btn'>aaa</button>"
    const res = compileHtml(html)
    expect(res).toEqual([
      new MyNode("button", ["aaa"], { disabled: "true", class: "btn" }),
    ])
  })

  it("should add comment node when there is a comment", () => {
    const html = `
      <div>
        <!--<p>aaa</p>-->
      </div>
    `
    const res = compileHtml(html)
    console.log(res)
    expect(res).toEqual([
      new MyNode("div", [new MyNode("comment", ["<p>aaa</p>"])]),
    ])
  })

  it("should add comment node when there is a comment after some text", () => {
    const html = `
      <div>
        bbb
        <!--<p>aaa</p>-->
      </div>
    `
    const res = compileHtml(html)
    console.log(res)
    expect(res).toEqual([
      new MyNode("div", ["bbb", new MyNode("comment", ["<p>aaa</p>"])]),
    ])
  })

  it("should throw when closing tag does not match opening tag", () => {
    const html = `
      <div>
        aaa
      </dic>
    `
    expect(() => {
      compileHtml(html)
    }).toThrow("Closing tag does not match opening tag")
  })
})

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

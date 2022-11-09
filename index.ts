const html = `<div>
  <p>
    testing
    <p>aaa</p>
    <span>testing</span>
  </p>
  <p>            cessssshi</p>
</div>`
// const html = "<p>testing</p>"

enum State {
  START,
  OPEN_TAG,
  CLOSE_TAG,
  TEXT,
}

class MyNode {
  tagName: string
  children: (MyNode | string)[]

  constructor(tagName: string, children: (MyNode | string)[] = []) {
    this.tagName = tagName
    this.children = children
  }

  print(indent = 0) {
    console.log(`${" ".repeat(indent)}${this.tagName}`)
    this.children.forEach((child) => {
      if (typeof child === "string") {
        console.log(`${" ".repeat(indent + 2)}${child}`)
      } else {
        child.print(indent + 2)
      }
    })
  }
}

function compileHtml(html: string) {
  let currentState: State = State.START
  let stack: MyNode[] = []
  let res: MyNode[] = []
  let curText: string = ""

  for (let i = 0, len = html.length; i < len; i++) {
    switch (currentState) {
      case State.START:
        if (html[i] === "<") {
          currentState = State.OPEN_TAG
        } else if (/[\n ]/.test(html[i])) {
          continue
        } else {
          currentState = State.TEXT
          curText += html[i]
        }
        break
      case State.OPEN_TAG:
        if (html[i] === ">") {
          currentState = State.START
          const node = new MyNode(curText)
          if (stack.length === 0) {
            res.push(node)
          }
          stack.push(node)
          curText = ""
        } else if (html[i] === "/") {
          currentState = State.CLOSE_TAG
        } else {
          curText += html[i]
        }
        break
      case State.TEXT:
        if (html[i] === "<") {
          currentState = State.OPEN_TAG
          stack[stack.length - 1].children.push(curText.trim())
          curText = ""
        } else {
          curText += html[i]
        }
        break
      case State.CLOSE_TAG:
        if (html[i] === ">") {
          if (curText !== stack[stack.length - 1].tagName) {
            throw "Closing tag does not match opening tag"
          }
          currentState = State.START
          curText = ""
          const popped = stack.pop()
          if (stack.length) {
            stack[stack.length - 1].children.push(popped!)
          }
        } else {
          curText += html[i]
        }
    }
  }

  return res
}

compileHtml(html).forEach((root) => root.print())

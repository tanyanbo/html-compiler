const html = `
<div>
  <p>
    testing
    <p>aaa</p>
    <button id='test-button' disabled>testing</button>
  </p>
  <p style="background-color: red">            cessssshi</p>
</div>
<header class='heading' id='main-title'>this is the title</header>
`
// const html = "<p>testing</p>"

enum State {
  START,
  OPEN_TAG,
  CLOSE_TAG,
  TEXT,
  PROPS,
}

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
])

export class MyNode {
  tagName: string
  children: (MyNode | string)[]
  props: Record<string, string>

  constructor(
    tagName: string,
    children: (MyNode | string)[] = [],
    props: Record<string, string> = {}
  ) {
    this.tagName = tagName
    this.children = children
    this.props = props
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

export function compileHtml(html: string) {
  let currentState: State = State.START
  let stack: MyNode[] = []
  let res: MyNode[] = []
  let curText: string = ""
  let curProps: Record<string, string> = {}

  function parseComment(startIdx: number): {
    isComment: boolean
    endIdx: number | null
  } {
    let slice = html.slice(startIdx)

    if (slice.startsWith("<!--")) {
      const endIdx = slice.indexOf("-->") + startIdx

      if (endIdx >= 0) {
        stack[stack.length - 1].children.push(
          new MyNode("comment", [html.slice(startIdx + 4, endIdx)])
        )
        return {
          isComment: true,
          endIdx: endIdx + 2,
        }
      }
    }

    return {
      isComment: false,
      endIdx: null,
    }
  }

  for (let i = 0, len = html.length; i < len; i++) {
    switch (currentState) {
      case State.START:
        if (html[i] === "<") {
          const isCommentRes = parseComment(i)
          if (isCommentRes.isComment) {
            i = isCommentRes.endIdx!
            continue
          }
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
          if (VOID_TAGS.has(curText.trim())) {
            currentState = State.START
            const node = new MyNode(curText.trim())
            curText = ""
            if (stack.length) {
              // current node is not a root element
              stack[stack.length - 1].children.push(node)
            } else {
              // current node is a root element
              res.push(node)
            }
          } else {
            currentState = State.START
            const node = new MyNode(curText.trim())
            if (stack.length === 0) {
              res.push(node)
            }
            stack.push(node)
          }
          curText = ""
        } else if (html[i] === "/") {
          if (html[i - 1] === "<") {
            currentState = State.CLOSE_TAG
          } else {
            // self-closing tag
            currentState = State.START
            const node = new MyNode(curText)
            curText = ""
            if (stack.length === 0) {
              res.push(node)
            } else {
              stack[stack.length - 1].children.push(node)
            }
            i++
          }
        } else if (html[i] === " ") {
          currentState = State.PROPS
          const node = new MyNode(curText, [], curProps)
          if (stack.length === 0) {
            res.push(node)
          }
          stack.push(node)
          curText = ""
        } else {
          curText += html[i]
        }
        break
      case State.TEXT:
        if (html[i] === "<") {
          const isCommentRes = parseComment(i)
          if (isCommentRes.isComment) {
            i = isCommentRes.endIdx!
            stack[stack.length - 1].children.splice(
              stack.length - 1,
              0,
              curText.trim()
            )
            curText = ""
            continue
          }
          currentState = State.OPEN_TAG
          curText.trim() &&
            stack[stack.length - 1].children.push(curText.trim())
          curText = ""
        } else {
          curText += html[i]
        }
        break
      case State.PROPS:
        if (html[i] === "=") {
          const quote = html[i + 1]
          for (let idx = i + 2; idx < len; idx++) {
            if (html[idx] === quote && html[idx - 1] !== "\\") {
              curProps[curText.trim()] = html.slice(i + 2, idx)
              i = idx
              curText = ""
              break
            }
          }
        } else if (html[i] === " ") {
          if (curText.trim()) {
            curProps[curText.trim()] = "true"
            curText = ""
          }
        } else if (html[i] === "/" && html[i + 1] === ">") {
          if (curText.trim() === "") {
            currentState = State.START
            curText = ""
            if (stack.length > 1) {
              stack[stack.length - 2].children.push(stack[stack.length - 1])
            }
            stack.pop()
            i++
          }
        } else if (html[i] === ">") {
          if (VOID_TAGS.has(stack[stack.length - 1].tagName)) {
            currentState = State.START
            curText = ""
            curProps = {}
            if (stack.length > 1) {
              stack[stack.length - 2].children.push(stack[stack.length - 1])
            }
            stack.pop()
            continue
          }
          if (curText !== "" && curText !== "/") {
            curProps[curText] = "true"
            curText = ""
          }
          currentState = State.START
          curProps = {}
        } else {
          curText += html[i]
        }
        break
      case State.CLOSE_TAG:
        if (html[i] === ">") {
          if (VOID_TAGS.has(curText.trim())) {
            currentState = State.START
            curText = ""
            continue
          }
          if (curText.trim() !== stack[stack.length - 1].tagName) {
            throw new Error("Closing tag does not match opening tag")
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

// compileHtml(html).forEach((root) => root.print())

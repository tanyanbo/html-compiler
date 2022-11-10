export class MyNode {
  tagName: string
  children: (MyNode | string)[]
  props: Record<string, string>
  el?: HTMLElement

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

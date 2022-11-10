import { MyNode } from "../compiler"

export function mount(vdom: MyNode[], container: HTMLElement) {
  vdom.forEach((vnode) => {
    const el = document.createElement(vnode.tagName)

    // props
    Object.entries(vnode.props).forEach(([key, value]) => {
      el.setAttribute(key, value)
    })

    // children
    vnode.children.forEach((child) => {
      if (typeof child === "string") {
        el.textContent += child
      } else {
        mount([child], el)
      }
    })

    container.appendChild(el)
  })
}

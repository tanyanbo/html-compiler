import { MyNode } from "../common/my-node"

export function render(vdom: MyNode[], container: HTMLElement) {
  patch(null, vdom, container)
}

export function patch(
  n1: MyNode[] | null,
  n2: MyNode[],
  container: HTMLElement
) {
  if (!n1) {
    mount(n2, container)
    return
  } else {
  }
}

function mount(vdom: MyNode[], container: HTMLElement) {
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

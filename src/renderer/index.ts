import { MyNode } from "../common/my-node"

export function render(vdom: MyNode, container: HTMLElement) {
  patch(null, vdom, container)
}

export function patch(
  vdomOld: MyNode | null,
  vdomNew: MyNode,
  container: HTMLElement
) {
  if (!vdomOld) {
    mount(vdomNew, container)
    return
  }

  // patch
}

function mount(vdom: MyNode, container: HTMLElement) {
  if (vdom.tagName === "root") {
    vdom.children.forEach((node) => {
      if (typeof node === "string") {
        container.textContent += node
      } else {
        mount(node, container)
      }
    })
    return
  }

  const el = (vdom.el = document.createElement(vdom.tagName))

  // props
  Object.entries(vdom.props).forEach(([key, value]) => {
    el.setAttribute(key, value)
  })

  // children
  vdom.children.forEach((child) => {
    if (typeof child === "string") {
      el.textContent += child
    } else {
      mount(child, container)
    }
  })

  container.appendChild(el)
}

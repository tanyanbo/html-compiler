import { MyNode } from "../common/my-node"

export function render(vdom: MyNode, container: HTMLElement) {
  mount(vdom, container)
}

export function patch(vNodeOld: MyNode, vNodeNew: MyNode) {
  if (vNodeOld.tagName === vNodeNew.tagName) {
    // patch
    const commonLength = Math.min(
      vNodeNew.children.length,
      vNodeOld.children.length
    )

    for (let i = 0; i < commonLength; i++) {
      patch(vNodeOld.children[i] as MyNode, vNodeNew.children[i] as MyNode)
    }
  } else {
    // replace
    const el = vNodeOld.el!

    // create new node
    const newEl = (vNodeNew.el = document.createElement(vNodeNew.tagName))

    // props
    Object.entries(vNodeNew.props).forEach(([key, value]) => {
      newEl.setAttribute(key, value)
    })

    // children
    vNodeNew.children.forEach((child) => {
      if (typeof child === "string") {
        newEl.textContent += child
      } else {
        mount(child, newEl)
      }
    })
    el.parentNode?.insertBefore(newEl, el)

    // delete old node
    el.parentNode?.removeChild(el)
  }
}

function patchProps(vdomOld: MyNode, vdomNew: MyNode) {}

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
      mount(child, el)
    }
  })

  container.appendChild(el)
}

import { MyNode } from "../common/my-node"

export function render(vdom: MyNode, container: HTMLElement) {
  mount(vdom, container)
}

export function patch(vNodeOld: MyNode, vNodeNew: MyNode) {
  if (vNodeOld.tagName === vNodeNew.tagName) {
    // patch
    const el = (vNodeNew.el = vNodeOld.el)

    // patch props
    patchProps(vNodeOld, vNodeNew, el!)

    // patch children
    const commonLength = Math.min(
      vNodeNew.children.length,
      vNodeOld.children.length
    )

    for (let i = 0; i < commonLength; i++) {
      if (typeof vNodeNew.children[i] === "string") {
        if (typeof vNodeOld.children[i] === "string") {
          // new: string, old: string
          el!.textContent = vNodeNew.children[i] as string
        } else {
          // new: string, old: node
        }
      } else {
        if (typeof vNodeOld.children[i] === "string") {
          // new: node, old: string
        } else {
          // new: node, old: node
          patch(vNodeOld.children[i] as MyNode, vNodeNew.children[i] as MyNode)
        }
      }
    }
  } else {
    // replace
    replaceNode(vNodeOld, vNodeNew)
  }
}

function replaceNode(vNodeOld: MyNode, vNodeNew: MyNode) {
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

function patchProps(vNodeOld: MyNode, vNodeNew: MyNode, el: HTMLElement) {
  const oldProps = vNodeOld.props
  const newProps = vNodeNew.props

  for (const key in newProps) {
    const value = newProps[key]
    if (value !== oldProps[key]) {
      el?.setAttribute(key, value)
    }
  }

  for (const key in oldProps) {
    if (!(key in newProps)) {
      el?.removeAttribute(key)
    }
  }
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
      mount(child, el)
    }
  })

  container.appendChild(el)
}

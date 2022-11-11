import { MyNode } from "../common/my-node"
import { compileHtml } from "../compiler"
import { watchEffect } from "../reactivity"

export function mountApp(
  component: Record<string, any>,
  container: HTMLElement
) {
  let isMounted = false
  let vdom: MyNode
  watchEffect(() => {
    if (!isMounted) {
      vdom = compileHtml(component.template)
      mount(vdom, container)
      container["_vdom"] = vdom
      isMounted = true
    } else {
      const newVdom = compileHtml(component.template)
      patch(container["_vdom"], newVdom)
      container["_vdom"] = newVdom
    }
  })
}

export function render(vdom: MyNode, container: HTMLElement) {
  mount(vdom, container)
}

function patch(vNodeOld: MyNode, vNodeNew: MyNode) {
  if (vNodeOld.tagName === vNodeNew.tagName) {
    // patch
    const el = (vNodeNew.el = vNodeOld.el!)

    // patch props
    patchProps(vNodeOld, vNodeNew, el)

    // patch children
    patchChildren(vNodeOld, vNodeNew, el)
  } else {
    // replace
    replaceNode(vNodeOld, vNodeNew)
  }
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

// TODO: need to consider the case where there are multiple child text nodes
function patchChildren(vNodeOld: MyNode, vNodeNew: MyNode, el: HTMLElement) {
  const commonLength = Math.min(
    vNodeNew.children.length,
    vNodeOld.children.length
  )

  for (let i = 0; i < commonLength; i++) {
    if (typeof vNodeNew.children[i] === "string") {
      if (typeof vNodeOld.children[i] === "string") {
        // new: string, old: string
        vNodeOld.children[i] !== vNodeNew.children[i] &&
          (el.textContent = vNodeNew.children[i] as string)
      } else {
        // new: string, old: node
        el.textContent = vNodeNew.children[i] as string
      }
    } else {
      if (typeof vNodeOld.children[i] === "string") {
        // new: node, old: string
        el.textContent = ""
        mount(vNodeNew.children[i] as MyNode, el)
      } else {
        // new: node, old: node
        patch(vNodeOld.children[i] as MyNode, vNodeNew.children[i] as MyNode)
      }
    }
  }

  if (vNodeNew.children.length > vNodeOld.children.length) {
    for (let i = commonLength; i < vNodeNew.children.length; i++) {
      if (typeof vNodeNew.children[i] === "string") {
        el.textContent = vNodeNew.children[i] as string
      } else {
        mount(vNodeNew.children[i] as MyNode, el)
      }
    }
  } else {
    for (let i = commonLength; i < vNodeOld.children.length; i++) {
      el.removeChild((vNodeOld.children[i] as MyNode).el!)
    }
  }
}

function mountPropsAndChildren(vNode: MyNode, el: HTMLElement) {
  // props
  Object.entries(vNode.props).forEach(([key, value]) => {
    if (key.startsWith("@")) {
      const fn = eval(value)
      el.addEventListener(key.slice(1), fn)
    } else {
      el.setAttribute(key, value)
    }
  })

  // children
  vNode.children.forEach((child) => {
    if (typeof child === "string") {
      el.textContent += child
    } else {
      mount(child, el)
    }
  })
}

function replaceNode(vNodeOld: MyNode, vNodeNew: MyNode) {
  const el = vNodeOld.el!

  // create new node
  const newEl = (vNodeNew.el = document.createElement(vNodeNew.tagName))

  mountPropsAndChildren(vNodeNew, newEl)

  el.parentNode?.insertBefore(newEl, el)

  // delete old node
  el.parentNode?.removeChild(el)
}

function mount(vNode: MyNode, container: HTMLElement) {
  if (vNode.tagName === "root") {
    vNode.children.forEach((node) => {
      if (typeof node === "string") {
        container.textContent += node
      } else {
        mount(node, container)
      }
    })
    return
  }

  const el = (vNode.el = document.createElement(vNode.tagName))

  mountPropsAndChildren(vNode, el)

  container.appendChild(el)
}

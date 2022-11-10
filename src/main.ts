import { compileHtml } from "./compiler"
import { mount } from "./renderer"

const html = `
  <div>
    <p>1</p>
    <p>2</p>
  </div>
`

const vdom = compileHtml(html)

mount(vdom, document.getElementById("app")!)

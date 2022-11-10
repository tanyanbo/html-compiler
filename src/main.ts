import { compileHtml } from "./compiler"
import { mount } from "./renderer"

const html = `
  <div id="parent-container">
    <p id='first' style="color: blue">1</p>
    <p class="second" style="color: red">2</p>
  </div>
`

const vdom = compileHtml(html)

mount(vdom, document.getElementById("app")!)

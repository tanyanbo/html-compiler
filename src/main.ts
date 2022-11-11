import { compileHtml } from "./compiler"
import { patch, render } from "./renderer"

let html = `
  <div id="parent-container">
    <p id='first' style="color: blue">5</p>
    <p class="second" style="color: red">2</p>
  </div>
`

const vdom = compileHtml(html)

render(vdom, document.getElementById("app")!)

html = `
  <div>
    <p id='first' >5</p>
    <p class="second" >2</p>
    <span style="color: magenta">hello world</span>
  </div>
`
const vdom2 = compileHtml(html)

setTimeout(() => {
  patch(vdom, vdom2)
}, 2000)

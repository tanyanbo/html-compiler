import { compileHtml } from "./compiler"
import { patch, render } from "./renderer"

const html = `
  <div id="parent-container">
    <p id='first' style="color: blue">1</p>
    <p class="second" style="color: red">2</p>
  </div>
`

const vdom = compileHtml(html)

render(vdom, document.getElementById("app")!)

const secondHtml = `
  <div id="parent-container">
    <p id='first' style="color: green">10</p>
    <p class="second" style="color: green">20</p>
  </div>
`
const vdom2 = compileHtml(secondHtml)
patch(vdom, vdom2, document.getElementById("#app")!)

import { compileHtml } from "./compiler"
import { patch, render } from "./renderer"

const html = `
  <div id="parent-container">
    <p id='first' style="color: blue">5</p>
    <p class="second" style="color: red">2</p>
  </div>
`

const vdom = compileHtml(html)

render(vdom, document.getElementById("app")!)

const secondHtml = `
  <div>
    <p id='first' >5</p>
    <p class="second" >2</p>
  </div>
`
const vdom2 = compileHtml(secondHtml)

setTimeout(() => {
  patch(vdom, vdom2)
}, 2000)

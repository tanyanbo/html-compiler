import { Ref } from "./reactivity"
import { mountApp } from "./renderer"

window["App"] = {
  data: {
    count: new Ref(10),
  },
  methods: {
    increment() {
      window["App"].data.count.value++
    },
    decrement() {
      window["App"].data.count.value--
    },
  },
  html: `
  <div id="parent-container">
    <p id='first' style="color: blue" onclick="window.App.methods.increment()">{{window.App.data.count.value}}</p>
    <p class="second" style="color: red" onclick="window.App.methods.decrement()">{{window.App.data.count.value}}</p>
  </div>
`,
}

mountApp(window["App"], document.getElementById("app")!)

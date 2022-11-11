import { Ref } from "./reactivity"
import { mountApp } from "./renderer"

window["App"] = {
  data: {
    count: new Ref(20),
    id: new Ref("parent"),
  },
  methods: {
    increment() {
      window["App"].data.count.value++
    },
    decrement() {
      window["App"].data.count.value--
    },
    changeId() {
      window["App"].data.id.value =
        window["App"].data.id.value === "parent" ? "child" : "parent"
    },
  },
  template: `
  <div :id="window.App.data.id.value">
    <p id='first' style="color: blue">{{window.App.data.count.value}}</p>
    <p class="second" style="color: red">{{window.App.data.count.value}}</p>
    <button @click="window.App.methods.increment" style="margin-right: 10px">+1</button>
    <button @click="window.App.methods.decrement">-1</button>
    <button @click="window.App.methods.changeId">change ID</button>
  </div>
`,
}

mountApp(window["App"], document.getElementById("app")!)

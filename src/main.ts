import { Ref } from "./reactivity"
import { mountApp } from "./renderer"

const App = {
  data: {
    count: new Ref(20),
    id: new Ref("parent"),
  },
  methods: {
    increment() {
      this.data.count.value++
    },
    decrement() {
      this.data.count.value--
    },
    changeId() {
      this.data.id.value = this.data.id.value === "parent" ? "child" : "parent"
    },
  },
  template: `
  <div :id="this.data.id.value">
    <p id='first' style="color: blue">{{this.data.count.value}}</p>
    <p class="second" style="color: red">{{this.data.count.value}}</p>
    <button @click="this.methods.increment" style="margin-right: 10px">+1</button>
    <button @click="this.methods.decrement">-1</button>
    <button @click="this.methods.changeId">change ID</button>
  </div>
`,
}

mountApp(App, document.getElementById("app")!)

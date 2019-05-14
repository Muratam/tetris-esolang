import "bulma/css/bulma.min.css";
import Vue from "vue";
import TetrisComponent from "./components/Tetris.vue";
if (!document.getElementById("app")) {
  let el = document.createElement("div");
  el.id = "app";
  document.body.appendChild(el);
}
new Vue({
  el: "#app",
  template: `<div><tetris-component /></div>`,
  components: { TetrisComponent }
});

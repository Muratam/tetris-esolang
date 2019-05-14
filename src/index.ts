import "bulma/css/bulma.min.css";
import Vue from "vue";
import TetrisComponent from "./components/Tetris.vue";
new Vue({
  el: "#app",
  template: `<div><tetris-component /></div>`,
  components: { TetrisComponent }
});

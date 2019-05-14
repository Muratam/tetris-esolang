<template lang="pug">
  div
    h1 Tetris Esolang
    input.input(v-model="name" type="text")
    h1 TetrisComponent
    .greeting Tetris {{name}}{{exclamationMarks}}
    button(@click="decrement") -
    button(@click="increment") +
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  // props: [],
  data() {
    return {
      name: "World",
      enthusiasm: 6
    };
  },
  methods: {
    increment() {
      this.enthusiasm++;
    },
    decrement() {
      if (this.enthusiasm > 1) {
        this.enthusiasm--;
      }
    }
  },
  computed: {
    exclamationMarks(): string {
      return Array(this.enthusiasm + 1).join("!");
    }
  }
});
</script>

<style lang="scss">
.greeting {
  font-size: 20px;
}
</style>

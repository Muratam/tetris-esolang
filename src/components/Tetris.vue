<template lang="pug">
  div
    nav.navbar.is-dark.is-fixed-top(role="navigation" aria-label="main navigation")
      .navbar-brand
        .navbar-item
          a.button.is-dark(@click="page='home'") Tetris Esolang
        .navbar-item
          a.button.is-dark(@click="page='try'") Try
          a.button.is-dark(@click="page='specification'") Specification
          a.button.is-dark(@click="page='example'") example
        .navbar-item
          .field.is-grouped
            .control
              a.bd-tw-button.button.is-dark(target="_blank" href="https://twitter.com/intent/tweet?text=tetrisesolang")
                .icon: i.fab.fa-twitter
            .control
              a.button.is-dark(href="https://github.com/jgthms/bulma/releases/download/0.7.4/bulma-0.7.4.zip")
                .icon: i.fab.fa-github
    .section(v-if="page==='home'")
      .title Tetris Esolang
      p created by
        a(href="https://muratam.github.io")  muratam
    .section(v-if="page==='try'")
      .content
        h2 Try It Now !!
        .columns
          .column
            .field
              canvas.tetriscanvas(:height="canvasHeight" :width="canvasWidth")
          .column
            .field
              textarea.textarea(placeholder="your code here!!" v-model="code")
        .field
          textarea.textarea(placeholder="input" v-model="stdin")
        .field
          textarea.textarea(placeholder="output" disabled v-model="stdout")
    .section(v-if="page==='specification'||page==='home'")
      .content
        h2 BNF
        pre {{tetrisbnf}}
        h2 処理
        p 横10 x 高さ20を持つテトリスフィールド上でテトリミノを操作し、テトリスを消すと命令が実行される。
        ul
          li 操作は ^,v,>,< が上下左右キーで、A,Bが回転
        p 各テトリミノには use-order が":"の時には固有の命令が書かれているので組み合わせて使う。 use-order が"."の時には何も描かれていない(XXXXの)テトリミノ。
        ul
          li I: IXX= (Iの書き方の上から順に)
          li L: LXXM (Lの書き方の上から順に)
          li J: JXX/ (Jの書き方の上から順に)
          li Z: ZXXB (Zの書き方の左上から順に)
          li S: SXXP (Sの書き方の右上から順に)
          li O: OX*X (Oの書き方の右上から順に)
          li T: +XX- (Tの書き方の左上から順に)
        p テトリミノの操作は tet-move  を上から順に実行していく。
        p brainfuckのように内部的に無限長のint32配列を持っており、それを指すポインタPがある。最初はすべて0で初期化されており、0番番地を差している。
        p 高さ20を超えてしまった場合、テトリスが終了するのでプログラムも(正常)終了する。
        p 演算結果はint32の変数Rに格納される。
        p テトリスを消すと通常のテトリスで加算される得点がRに格納される。(例:1ライン削除でR=100)
        p その後削除されたテトリミノの左上から順に命令を実行する。一番上の行を左から実行し終えたら次の行を実行...という流れ。
        ul
          li X:Nop
          li I: 標準入力から1文字取ってRをそのユニコード値にする。
          li O:標準出力にRの値をユニコード値として出力。
          li J:ラベル R にジャンプ。複数同じラベルがある場合はプログラム実行前にエラーをだす。
          li Z: P = 0 . Zero.
          li P: P += R. ポインタを動かす。Pointer.
          li L: R = P[0] .Load.
          li S: P[0] = R. Store.
          li +-*/%= : よくある二項演算 (=は宇宙船演算)。R = R op P[0]
          li M: R = -R . Minus.
          li B: テトリスフィールドをすべて削除し、以降の命令は実行されない。Bomb.
    .section(v-if="page==='example'")
      .content
        h2 example
        pre {{exampleCode}}
        h2 example with comment
        pre {{exampleCodeWithComment}}
        //- input.input(v-model="name" type="text")
</template>

<script lang="ts">
import Vue from "vue";
import { tetrisBNF, exampleCode, exampleCodeWithComment } from "../staticcode";
export default Vue.extend({
  data() {
    return {
      page: "home",
      canvasWidth: 1080,
      canvasHeight: 720,
      code: "",
      stdin: "",
      stdout: "",
      tetrisbnf: tetrisBNF,
      exampleCode: exampleCode,
      exampleCodeWithComment: exampleCodeWithComment
    };
  },
  methods: {
    draw() {
      let anyCanvas: any = this.$el.getElementsByClassName("tetriscanvas");
      if (!anyCanvas || !anyCanvas[0]) return;
      let canvas: HTMLCanvasElement = anyCanvas[0];
      let ctx = canvas.getContext("2d");
      if (ctx === null) return;
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.fillStyle = "rgb(200,0,0)";
      ctx.fillRect(10, 10, 55, 50);
      ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
      ctx.fillRect(30, 30, 55, 50);
    }
  },
  watch: {
    page(val) {
      this.$nextTick(this.draw);
    }
  },
  mounted() {},
  computed: {
    exclamationMarks(): string {
      return "";
    }
  }
});
</script>

<style lang="scss" scoped>
.greeting {
  font-size: 20px;
}
textarea {
  font-family: "monospace";
}
canvas {
  background: black;
  border-color: #dbdbdb;
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  width: 100%;
}
</style>

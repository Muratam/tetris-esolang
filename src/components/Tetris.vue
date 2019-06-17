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
            //- .control
            //-   a.bd-tw-button.button.is-dark(target="_blank" href="https://twitter.com/intent/tweet?text=tetrisesolang")
            //-     .icon: i.fab.fa-twitter
            .control
              a.button.is-dark(href="https://github.com/Muratam/tetris-esolang")
                .icon: i.fab.fa-github
    .section(v-if="page==='home'")
      .title Tetris Esolang
      p created by
        a(href="https://muratam.github.io")  muratam
    .section(v-if="page==='try'")
      .content
        h2 Try Tetris Esolang Now !!
        .field.is-grouped
          .control
            a.button(@click="trySample")
              .icon: i.fas.fa-code
              p Try Sample
        .columns
          .column
            .field
              canvas(ref="tetrisCanvas" :height="canvasHeight" :width="canvasWidth")
          .column
            .field.is-grouped
              .control
                a.button(@click="execute1Step")
                  .icon: i.fas.fa-play
                  p Execute 1 Step
              .control
                a.button(@click="executeAllStep")
                  .icon: i.fas.fa-angle-double-right
                  p Execute 1000 Steps
            .field
              textarea.textarea(ref="codeTextarea" placeholder="your code here!!" v-model="code")
            .field
              textarea.textarea(placeholder="standard input" v-model="stdin")
            .field
              textarea.textarea(placeholder="standard output" disabled v-model="stdout")
            .field
              textarea.textarea(placeholder="debug message" disabled v-model="debugMessage")
    .section(v-if="page==='specification'||page==='home'")
      .content
        h2 BNF
        pre {{tetrisbnf}}
        h2 処理
        p 横10 x 高さ20を持つテトリスフィールド上でテトリミノを操作し、テトリスを消すと命令が実行される。
        ul
          li 操作は ^,v,>,< が上下左右キーで、Aが時計回りの回転、Bが反時計回りの回転
          li
            a(href="http://www10.plala.or.jp/code1484/game/tgmvs/tgm-w-kaiten.htm") ワールドルールの回転をする
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
        p 高さ20を超えてしまった場合、テトリスが終了するのでプログラムも(正常)終了する。実行できる命令がない場合も終了する。
        p 演算結果はint32の変数Rに格納される。
        p テトリスを消すと通常のテトリスで加算される得点がRに格納される。nライン削除でR=100*n
        p Tスピンなどの追加得点は存在しない。あくまでnライン削除でR=100*nのみ。
        a(href="https://www45.atwiki.jp/tetriskakera/pages/19.html") テトリスの出現位置について
        p その後削除されたテトリミノの左上から順に命令を実行する。一番上の行を左から実行し終えたら次の行を実行...という流れ。
        ul
          li X:Nop
          li I: 標準入力から1文字取ってRをそのユニコード値にする。EOFではR=-1となる。
          li O:標準出力にRの値をユニコード値として出力。
          li J:ラベル R にジャンプ。複数同じラベルがある場合はプログラム実行前にエラーをだす。ラベルが存在しない場合はジャンプしない。
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
        div(v-for="example in exampleCodes")
          pre {{example}}
          hr
        //- input.input(v-model="name" type="text")
</template>

<script lang="ts">
import Vue from "vue";
import { TetrisInterpreter, tetriminos } from "../tetriscore";
import { tetrisBNF, exampleCodes } from "../staticcode";
export default Vue.extend({
  data() {
    return {
      page: "home",
      canvasWidth: 640,
      canvasHeight: 640,
      executed: false,
      code: "",
      stdin: "",
      stdout: "",
      debugMessage: "",
      core: new TetrisInterpreter("", ""),
      tetrisbnf: tetrisBNF,
      exampleCodes: exampleCodes
    };
  },
  methods: {
    trySample() {
      this.code = exampleCodes[0];
      this.stdin = "sample cat program input";
    },
    executeAllStep() {
      for (let i = 0; i < 1000; i++) this.execute1Step();
    },
    execute1Step() {
      if (!this.executed) {
        this.core = new TetrisInterpreter(this.code, this.stdin);
        if (this.core.errorMessage) {
          this.debugMessage = this.core.errorMessage;
          return;
        }
        this.executed = true;
      }
      let res = this.core.execute1Step();
      if (res !== "") this.stdout = this.stdout + res;
      this.debugMessage = this.core.stateMessage;
      this.draw(this.core.state);
    },
    drawConst(ctx: CanvasRenderingContext2D) {
      ctx.font = `30px Menlo, "Courier New", Consolas, monospace`;
      // 4x4
      // 0123
      // 4567
      // 89ab
      const tiles = tetriminos;
      let i = 0;
      ctx.strokeStyle = "gray";
      ctx.fillStyle = "gray";
      for (let key in tiles) {
        for (let num in tiles[key]) {
          let n = parseInt(num);
          let x = (n % 4) * 35;
          let y = Math.floor(n / 4) * 35;
          ctx.strokeRect(380 + x, 90 * i + y, 30, 30);
          let str = tiles[key][num];
          if (str !== "X") ctx.fillText(str, 380 + x + 5, 90 * i + y + 25);
        }
        ctx.fillText(`[${key}]`, 530, 90 * i + 60);
        i++;
      }
      ctx.strokeRect(360, 10, 240, 20 + 30 * 20);
    },
    draw(state: Array<Array<string>>) {
      let anyCanvas: any = this.$refs.tetrisCanvas;
      if (!anyCanvas) return;
      let canvas: HTMLCanvasElement = anyCanvas;
      let ctx = canvas.getContext("2d");
      if (ctx === null) return;
      let w = this.canvasWidth;
      let h = this.canvasHeight;
      ctx.clearRect(0, 0, w, h);
      this.drawConst(ctx);
      ctx.strokeStyle = "gray";
      ctx.strokeRect(10, 10, 20 + 30 * 10, 20 + 30 * 20);
      ctx.font = `25px Menlo, "Courier New", Consolas, monospace`;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 20; y++) {
          let isInValid = !state || !state[x] || !state[x][y];
          ctx.fillStyle = isInValid ? "#181818" : "gray";
          ctx.fillRect(20 + 30 * x, 20 + 30 * y, 27, 27);
          if (isInValid) continue;
          ctx.fillStyle = "#000";
          ctx.fillText(state[x][y], 25 + 30 * x, 42 + 30 * y);
        }
      }
    }
  },
  watch: {
    page(val) {
      this.$nextTick(() => this.draw([]));
    },
    stdin(val) {
      if (!this.$refs.codeTextarea) return;
      this.executed = false;
      this.stdout = "";
      this.draw([]);
    },
    code(val) {
      if (!this.$refs.codeTextarea) return;
      this.executed = false;
      this.stdout = "";
      this.draw([]);
      if (!val) return;
      // let anyTextArea: any = this.$refs.codeTextarea;
      // let textArea: HTMLTextAreaElement = anyTextArea;
      // textArea.rows = Math.max(3, val.split("\n").length);
    }
  }
});
</script>

<style lang="scss" scoped>
.greeting {
  font-size: 20px;
}
textarea {
  font-family: "Menlo", "Courier New", Consolas, monospace;
}
canvas {
  background: black;
  border-color: #dbdbdb;
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  width: 100%;
}
</style>

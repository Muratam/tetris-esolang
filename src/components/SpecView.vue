<script setup lang="ts">
import { tetrisBNF } from "../staticcode";
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>BNF</h2>
    </div>
    <pre class="code-block">{{ tetrisBNF }}</pre>
  </section>
  <section class="panel">
    <div class="panel-head">
      <h2>処理</h2>
    </div>
    <div class="prose">
      <p>横10 x 高さ20を持つテトリスフィールド上でテトリミノを操作し、テトリスを消すと命令が実行される。</p>
      <ul>
        <li>操作は ^,V,>,&lt; が上下左右キーで、Aが時計回りの回転、Bが反時計回りの回転</li>
        <li><a href="http://www10.plala.or.jp/code1484/game/tgmvs/tgm-w-kaiten.htm">ワールドルールの回転をする</a></li>
      </ul>
      <p>各テトリミノには use-order が":"の時には固有の命令が書かれているので組み合わせて使う。 use-order が"."の時には何も描かれていない(XXXXの)テトリミノ。</p>
      <ul>
        <li>I: IXX= (Iの書き方の上から順に)</li>
        <li>L: LXXM (Lの書き方の上から順に)</li>
        <li>J: JXX/ (Jの書き方の上から順に)</li>
        <li>Z: ZXXB (Zの書き方の左上から順に)</li>
        <li>S: SXXP (Sの書き方の右上から順に)</li>
        <li>O: OX*X (Oの書き方の右上から順に)</li>
        <li>T: +XX- (Tの書き方の左上から順に)</li>
      </ul>
      <p>テトリミノの操作は tet-move を上から順に実行していく。</p>
      <p>brainfuckのように内部的に無限長の数値型(実装依存:js実装ではNumberも可)の配列Aを持っており、それにアクセスするための数値型のPがある。最初はAの要素はすべて0で初期化されている。また、最初はP=0である。</p>
      <p>高さ20を超えてしまった場合、テトリスが終了するのでプログラムも(正常)終了する。実行できる命令がない場合も終了する。</p>
      <p>演算結果は変数R(型は実装依存の数値型)に格納される。</p>
      <p>テトリスを消すと通常のテトリスで加算される得点がRに格納される。nライン削除でR=100*n</p>
      <p>Tスピンなどの追加得点は存在しない。あくまでnライン削除でR=100*nのみ。</p>
      <p><a href="https://www45.atwiki.jp/tetriskakera/pages/19.html">テトリスの出現位置について</a></p>
      <p>その後削除されたテトリミノの左上から順に命令を実行する。一番上の行を左から実行し終えたら次の行を実行...という流れ。</p>
      <ul>
        <li>X:Nop</li>
        <li>I: 標準入力から1文字取ってRをそのユニコード値にする。EOFではR=-1となる。</li>
        <li>O:標準出力にRの値をユニコード値として出力。</li>
        <li>J:ラベル R にジャンプ。複数同じラベルがある場合はプログラム実行前にエラーをだす。ラベルが存在しない場合はジャンプしない。</li>
        <li>Z: P = 0 . Zero.</li>
        <li>P: P += R. ポインタを動かす。Pointer.</li>
        <li>L: R = A[P] .Load.</li>
        <li>S: A[P] = R. Store.</li>
        <li>+-*/= : よくある二項演算 (=は宇宙船演算)。R = R op A[P]</li>
        <li>M: R = -R . Minus.</li>
        <li>B: テトリスフィールドをすべて削除し、以降の命令は実行されない。Bomb.</li>
      </ul>
    </div>
  </section>
</template>

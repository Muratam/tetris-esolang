<script setup lang="ts">
// 仕様（readme.md と同じ内容を、表と図で）
import AppIcon from "./AppIcon.vue";
import MinoShape from "./MinoShape.vue";
import { tetrisBNF } from "../staticcode";
import { instructions, minoOrders, moves } from "../ops";
import { samples } from "../samples";
import { openInTry } from "../store";

const walkthrough = samples.find((s) => s.id === "cat")!;
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>処理の流れ</h2>
    </div>
    <ol class="flow">
      <li>横 10 × 高さ 20 のテトリスフィールドで、コードの行を上から順に 1 つずつ実行する。1 行で 1 つのテトリミノが出現し、書かれた操作をしてから下まで落ちる（<a href="http://www10.plala.or.jp/code1484/game/tgmvs/tgm-w-kaiten.htm">回転はワールドルール</a>。<a href="https://www45.atwiki.jp/tetriskakera/pages/19.html">テトリスの出現位置について</a>）。</li>
      <li>行がそろって消えると、通常のテトリスで加算される得点が R に入る。n ライン削除で R = 100 × n（T スピンなどの追加得点は無い）。</li>
      <li>その後、消えた行のテトリミノの文字を、上の行から、行の中は左から順に命令として実行する。</li>
      <li>brainfuck のように、内部に無限長の数値の配列 A と、それを指す数値 P を持つ。最初は A の要素はすべて 0、P = 0。演算の結果は R に入る。</li>
      <li>高さ 20 を超えたら（出現の位置に置けなかったら）テトリスが終わるので、プログラムも（正常）終了する。実行できる行が無い場合も終了する。</li>
    </ol>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>書き方</h2>
    </div>
    <div class="grid2">
      <table class="tbl">
        <thead>
          <tr>
            <th>要素</th>
            <th>書き方</th>
            <th>意味</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>テトリミノ</td>
            <td><code>I L J Z S O T</code></td>
            <td>出現するミノの種類（行の 1 文字目）</td>
          </tr>
          <tr>
            <td>use-order</td>
            <td><code>:</code> / <code>.</code></td>
            <td><code>:</code> は命令の書かれたミノ、<code>.</code> は何も書かれていない（XXXX の）ミノ</td>
          </tr>
          <tr>
            <td>操作</td>
            <td><code>&lt; &gt; V ^ A B</code></td>
            <td>左から順に行う（下の表）。最後に下まで落ちる</td>
          </tr>
          <tr>
            <td>ラベル</td>
            <td><code>100:</code></td>
            <td>J 命令の飛び先。同じラベルが 2 つあるとエラー</td>
          </tr>
          <tr>
            <td>コメント</td>
            <td><code># ...</code></td>
            <td><code>#</code> から行末まで無視する</td>
          </tr>
        </tbody>
      </table>
      <div>
        <p class="cap">
          BNF
        </p>
        <pre class="code-block">{{ tetrisBNF }}</pre>
        <p class="cap">
          例: <code>I:AA&lt;&lt;&lt;</code> は「命令の書かれた I ミノを時計回りに 2 回まわし、左へ 3 マス動かして落とす」。
        </p>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>操作</h2>
    </div>
    <table class="tbl narrow">
      <tbody>
        <tr
          v-for="m in moves"
          :key="m.ch"
        >
          <td class="key">
            <code>{{ m.ch }}</code>
          </td>
          <td>{{ m.text }}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>ミノに書かれた命令（<code>:</code> のとき）</h2>
    </div>
    <ul class="minos">
      <li
        v-for="m in minoOrders"
        :key="m.mino"
      >
        <MinoShape :mino="m.mino" />
        <div>
          <b class="mname">{{ m.mino }}</b>
          <code>{{ m.order }}</code>
          <span class="quiet">（{{ m.mino }} の書き方の{{ m.note }}）</span>
        </div>
      </li>
    </ul>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>命令</h2>
    </div>
    <table class="tbl">
      <thead>
        <tr>
          <th>文字</th>
          <th>名前</th>
          <th>動き</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="i in instructions"
          :key="i.ch"
        >
          <td class="key">
            <code>{{ i.ch }}</code>
          </td>
          <td>{{ i.name }}</td>
          <td>{{ i.text }}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>例: cat（入力をそのまま出す）</h2>
      <button
        type="button"
        class="btn btn-small"
        @click="openInTry(walkthrough)"
      >
        <AppIcon name="open" />
        Try で開く
      </button>
    </div>
    <div class="grid2">
      <pre class="code-block">{{ walkthrough.code }}</pre>
      <ol class="flow small">
        <li><code>100:</code> ここからがラベル 100。</li>
        <li><code>I.&gt;&gt;&gt;</code> を 2 回: 何も書かれていない I ミノを右へ寄せて置く（最下段の右側を埋める）。</li>
        <li><code>O:B</code>: O と * の書かれた O ミノを回して置く。</li>
        <li><code>I:&lt;&lt;&lt;</code>: 「IXX=」の I ミノを横向きに左へ置くと、最下段がそろって消え、<code>=</code> <code>I</code> <code>O</code> の順に実行される（1 文字読んで、そのまま出力）。</li>
        <li><code>J:&lt;&lt;&lt;</code> と <code>Z:A&lt;</code>: 残った最下段を J ミノと Z ミノでそろえると、<code>J</code>（ジャンプ）と <code>B</code>（フィールドを消去）が実行される。R = 100 なのでラベル 100 に戻り、くり返す。</li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.flow {
  display: grid;
  gap: 6px;
  margin: 0;
  padding-left: 1.4em;
  font-size: 0.9rem;
}
.flow li::marker {
  color: var(--accent);
  font-weight: 700;
}
.flow.small {
  font-size: 0.86rem;
  color: var(--ink-sub);
}
.grid2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
}
.cap {
  margin: 0 0 6px;
  font-size: 0.82rem;
  color: var(--ink-soft);
}
.cap + .code-block {
  margin-bottom: 10px;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
}
.tbl.narrow {
  max-width: 520px;
}
.tbl th,
.tbl td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
.tbl th {
  color: var(--ink-soft);
  font-size: 0.78rem;
  font-weight: 600;
}
.tbl tbody tr:last-child td {
  border-bottom: 0;
}
.key {
  width: 3em;
}
code {
  padding: 0 5px;
  background: var(--surface-3);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.92em;
  white-space: nowrap;
}
h2 code {
  font-size: 0.86em;
}
.minos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.minos li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-side);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: 0.86rem;
}
.minos li > div {
  display: grid;
  justify-items: start;
  gap: 2px;
}
.mname {
  font-size: 1rem;
}
@media (min-width: 860px) {
  .grid2 {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
}
</style>

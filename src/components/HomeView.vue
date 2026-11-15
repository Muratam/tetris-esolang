<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
import MinoShape from "./MinoShape.vue";
import { samples } from "../samples";
import { app, openInTry } from "../store";
</script>

<template>
  <section class="hero">
    <h1>Tetris Esolang</h1>
    <p class="lead">
      テトリスでプログラムを書く、難解プログラミング言語（esolang）です。
      テトリミノを動かして積み、行をそろえて消すと、消えた行のミノに書かれた文字が命令として実行されます。
    </p>
    <p class="quiet by">
      作者: <a href="https://muratam.github.io">muratam</a>
    </p>
    <div class="cta">
      <button
        type="button"
        class="btn btn-primary"
        @click="openInTry(samples[0], true)"
      >
        <AppIcon name="play" />
        サンプルを試す
      </button>
      <button
        type="button"
        class="btn"
        @click="app.page = 'specification'"
      >
        仕様を読む
      </button>
    </div>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>仕組み</h2>
    </div>
    <ol class="how">
      <li>
        <div class="fig">
          <code class="big">O:B</code>
        </div>
        <div>
          <h3>1 行に 1 つ、ミノと動かし方を書く</h3>
          <p>ミノの種類（I・L・J・Z・S・O・T）、命令つき（<code>:</code>）か空（<code>.</code>）か、操作（<code>&lt; &gt; V ^ A B</code>）の順に書きます。上の行から順に 1 つずつ出現し、操作の後に下まで落ちます。</p>
        </div>
      </li>
      <li>
        <div class="fig">
          <MinoShape mino="O" />
        </div>
        <div>
          <h3>ミノには命令の文字が書かれている</h3>
          <p>命令つきのミノは、マスに決まった命令を持っています（O ミノなら O と *）。何も書かれていないマスは何もしません。</p>
        </div>
      </li>
      <li>
        <div class="fig">
          <span class="row-demo"><b>=</b><i /><i /><b>I</b><b>O</b><i /><i /><i /><i /><i /></span>
        </div>
        <div>
          <h3>行がそろうと消えて、命令を実行</h3>
          <p>そろって消えた行の文字を、左から順に命令として実行します（例: <code>=</code> <code>I</code> <code>O</code> → 1 文字読んで出力）。消えた行の数 × 100 が R に入るので、J（ジャンプ）でラベル 100 などへ飛べます。</p>
        </div>
      </li>
    </ol>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h2>サンプルを選んで試す</h2>
      <button
        type="button"
        class="btn btn-small"
        @click="app.page = 'example'"
      >
        説明つきの一覧
      </button>
    </div>
    <ul class="samples">
      <li
        v-for="s in samples"
        :key="s.id"
      >
        <div>
          <h3>{{ s.title }}</h3>
          <p class="quiet">
            {{ s.short }}
          </p>
        </div>
        <button
          type="button"
          class="btn"
          @click="openInTry(s, true)"
        >
          <AppIcon name="play" />
          実行する
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 8px;
  padding: 12px 0 4px;
}
.hero h1 {
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.lead {
  max-width: 46em;
  font-size: 1rem;
  color: var(--ink-sub);
}
.by {
  font-size: 0.86rem;
}
.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.how {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: how;
}
.how li {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 14px;
  align-items: center;
}
.how h3 {
  margin-bottom: 2px;
  font-size: 0.92rem;
  font-weight: 650;
}
.how h3::before {
  counter-increment: how;
  content: counter(how) ". ";
  color: var(--accent);
}
.how p {
  font-size: 0.88rem;
  color: var(--ink-sub);
}
.fig {
  display: flex;
  justify-content: center;
}
code {
  padding: 0 5px;
  background: var(--surface-3);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.9em;
}
.big {
  padding: 4px 10px;
  font-size: 1.1rem;
  color: var(--ink);
}
.row-demo {
  display: flex;
  gap: 1px;
}
.row-demo b,
.row-demo i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 18px;
  border-radius: 2px;
  background: var(--accent);
  color: var(--accent-ink);
  font: 700 11px var(--font-mono);
  font-style: normal;
}
.row-demo i {
  opacity: 0.55;
}
.samples {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.samples li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-side);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}
.samples h3 {
  font-size: 0.9rem;
  font-weight: 650;
}
.samples p {
  font-size: 0.84rem;
}
@media (max-width: 480px) {
  .how li {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .fig {
    justify-content: flex-start;
  }
  .samples li {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

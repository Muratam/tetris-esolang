<script setup lang="ts">
import AppIcon from "./components/AppIcon.vue";
import ExamplesView from "./components/ExamplesView.vue";
import HomeView from "./components/HomeView.vue";
import SpecView from "./components/SpecView.vue";
import TryView from "./components/TryView.vue";
import { app, type Page } from "./store";

const tabs: { id: Page; label: string }[] = [
  { id: "try", label: "Try" },
  { id: "specification", label: "Specification" },
  { id: "example", label: "example" },
];
</script>

<template>
  <!-- 上の帯: 印と名前（ホームへ）・タブ（左揃え）・GitHub（右端）。タブの見た目は Muratam/akochandaaaaaa の .ako-tab と同じ -->
  <header class="bar">
    <div class="bar-inner">
      <button
        type="button"
        class="brand"
        :aria-current="app.page === 'home' ? 'page' : undefined"
        @click="app.page = 'home'"
      >
        <span
          class="mark"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 12 12"
            width="16"
            height="16"
          >
            <rect
              x="0"
              y="2"
              width="12"
              height="4"
              rx="0.6"
            />
            <rect
              x="4"
              y="6"
              width="4"
              height="4"
              rx="0.6"
            />
          </svg>
        </span>
        <span class="name">Tetris Esolang</span>
      </button>
      <nav
        class="tabs"
        aria-label="ページ"
      >
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="tab"
          :data-label="t.label"
          :aria-current="app.page === t.id ? 'page' : undefined"
          @click="app.page = t.id"
        >
          {{ t.label }}
        </button>
      </nav>
      <a
        class="gh"
        href="https://github.com/Muratam/tetris-esolang"
        aria-label="GitHub"
        title="GitHub"
      >
        <AppIcon name="github" />
      </a>
    </div>
  </header>

  <main class="main">
    <HomeView v-if="app.page === 'home'" />

    <!-- 書いたコードと実行の状態はタブを移っても残す（元の版と同じ） -->
    <TryView
      v-show="app.page === 'try'"
      :active="app.page === 'try'"
    />

    <SpecView v-if="app.page === 'specification'" />
    <ExamplesView v-if="app.page === 'example'" />
  </main>
</template>
<style scoped>
.bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.bar-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 8px 0 16px;
}
/* 印と名前（akochan の .ako-brand・.ako-mark・.ako-name と同じ寸法） */
.brand {
  display: flex;
  flex: none;
  align-items: center;
  gap: 10px;
  min-height: 34px;
  padding: 0;
  background: none;
  border: 0;
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}
.mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  color: var(--accent);
}
.mark svg {
  fill: currentColor;
}
.name {
  font-size: 1rem;
  font-weight: 650;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
/* タブ（akochan の .ako-tabs・.ako-tab と同じ）: 枠なし、選んだタブだけ文字を濃く太くして下に 2px の線 */
.tabs {
  display: flex;
  flex: 1;
  align-self: stretch;
  min-width: 0;
  margin-bottom: -1px;
}
.tab {
  flex: 1;
  min-height: 48px;
  padding: 0 4px;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--ink-soft);
  font: inherit;
  font-size: 0.9rem;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
/* 選ぶと太字になって幅が変わり、右のタブがずれるので、太字の幅を先に取っておく（見えない ::after） */
.tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.tab::after {
  content: attr(data-label);
  content: attr(data-label) / "";
  height: 0;
  overflow: hidden;
  visibility: hidden;
  font-weight: 600;
  pointer-events: none;
  user-select: none;
}
.tab:hover {
  color: var(--ink);
}
.tab[aria-current="page"] {
  color: var(--ink);
  font-weight: 600;
  border-bottom-color: var(--accent);
}
/* GitHub は帯の右端 */
.gh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: none;
  margin-left: auto;
  color: var(--ink-soft);
  border-radius: var(--radius-sm);
}
.gh:hover {
  color: var(--ink);
  background: var(--surface-2);
}
.gh .icon {
  width: 18px;
  height: 18px;
}
/* 狭い画面では名前を隠して、印・タブ・GitHub を 1 段に（読み上げには残す。akochan と同じ） */
@media (max-width: 699px) {
  .name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
@media (min-width: 700px) {
  .bar-inner {
    gap: 16px;
    padding: 0 16px;
  }
  .tabs {
    flex: 0 1 auto;
  }
  .tab {
    flex: none;
    min-height: 56px;
    padding: 0 16px;
  }
}
.main {
  display: grid;
  gap: 16px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 16px 48px;
}
@media (max-width: 480px) {
  .main {
    padding: 12px 12px 40px;
  }
}
</style>

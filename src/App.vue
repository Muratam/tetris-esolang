<script setup lang="ts">
import { ref } from "vue";
import AppIcon from "./components/AppIcon.vue";
import SpecView from "./components/SpecView.vue";
import TryView from "./components/TryView.vue";
import { exampleCodes } from "./staticcode";

type Page = "home" | "try" | "specification" | "example";
const page = ref<Page>("home");
const tabs: { id: Page; label: string }[] = [
  { id: "try", label: "Try" },
  { id: "specification", label: "Specification" },
  { id: "example", label: "example" },
];
</script>

<template>
  <header class="bar">
    <div class="bar-inner">
      <button
        type="button"
        class="brand"
        :aria-current="page === 'home' ? 'page' : undefined"
        @click="page = 'home'"
      >
        Tetris Esolang
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
          :aria-current="page === t.id ? 'page' : undefined"
          @click="page = t.id"
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
    <section
      v-if="page === 'home'"
      class="hero"
    >
      <h1>Tetris Esolang</h1>
      <p class="quiet">
        created by
        <a href="https://muratam.github.io">muratam</a>
      </p>
    </section>

    <!-- 書いたコードと実行の状態はタブを移っても残す（元の版と同じ） -->
    <TryView
      v-show="page === 'try'"
      :active="page === 'try'"
    />

    <SpecView v-if="page === 'specification' || page === 'home'" />

    <section
      v-if="page === 'example'"
      class="panel"
    >
      <div class="panel-head">
        <h2>example</h2>
      </div>
      <div class="examples">
        <pre
          v-for="(example, i) in exampleCodes"
          :key="i"
          class="code-block"
        >{{ example }}</pre>
      </div>
    </section>
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
  gap: 4px 12px;
  max-width: 1120px;
  min-height: var(--bar-h);
  margin: 0 auto;
  padding: 0 16px;
}
.brand {
  padding: 4px 0;
  text-align: left;
  background: none;
  border: 0;
  color: var(--ink);
  font: inherit;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  cursor: pointer;
}
.tabs {
  display: flex;
  flex: 1;
  min-width: 0;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tab {
  min-height: 34px;
  padding: 4px 10px;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--ink-soft);
  font: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}
.tab:hover {
  color: var(--ink);
}
.tab[aria-current="page"] {
  background: var(--accent-soft);
  border-color: rgba(71, 200, 230, 0.35);
  color: var(--accent);
}
.gh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: none;
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
.main {
  display: grid;
  gap: 16px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 16px 48px;
}
.hero {
  display: grid;
  gap: 4px;
  padding: 12px 0 4px;
}
.hero h1 {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.examples {
  display: grid;
  gap: 12px;
}
@media (max-width: 480px) {
  .bar-inner {
    flex-wrap: wrap;
    padding: 6px 12px;
  }
  .brand {
    flex: 1;
  }
  .tabs {
    order: 3;
    flex-basis: 100%;
    margin: 0 -4px;
  }
  .main {
    padding: 12px 12px 40px;
  }
}
</style>

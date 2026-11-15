<script setup lang="ts">
import AppIcon from "./AppIcon.vue";
import { samples } from "../samples";
import { openInTry } from "../store";
</script>

<template>
  <section
    v-for="s in samples"
    :key="s.id"
    class="panel"
  >
    <div class="panel-head">
      <h2>{{ s.title }}</h2>
      <div class="btns">
        <button
          type="button"
          class="btn btn-small"
          @click="openInTry(s)"
        >
          <AppIcon name="open" />
          開く
        </button>
        <button
          type="button"
          class="btn btn-small btn-primary"
          @click="openInTry(s, true)"
        >
          <AppIcon name="play" />
          実行
        </button>
      </div>
    </div>
    <p class="desc">
      {{ s.description }}
    </p>
    <p
      v-if="s.stdin"
      class="quiet stdin"
    >
      開いたときの標準入力: <code>{{ s.stdin }}</code>
    </p>
    <pre class="code-block ex">{{ s.shown }}</pre>
  </section>
</template>

<style scoped>
.btns {
  display: flex;
  gap: 6px;
}
.desc {
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: var(--ink-sub);
}
.stdin {
  margin-bottom: 10px;
  font-size: 0.82rem;
}
code {
  padding: 0 5px;
  background: var(--surface-3);
  border-radius: 4px;
  font-family: var(--font-mono);
}
.ex {
  max-height: 420px;
  overflow: auto;
}
</style>

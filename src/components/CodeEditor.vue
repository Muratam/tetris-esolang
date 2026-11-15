<script setup lang="ts">
// 行番号つきのコードの欄。いま置いた行・その直前の行・次に置く行・エラーの行に印を付ける。
// 文字は textarea がそのまま描き、印と行番号は後ろと左に同じ行の高さで重ねる（スクロールを合わせる）。
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const model = defineModel<string>({ required: true });
const props = defineProps<{
  current: number | null;
  previous: number | null;
  next: number | null;
  errors: number[];
  /** 増えたら、いま置いた行が見えるようにスクロールする */
  revealKey: number;
}>();

const PAD = 8; // 上の余白（px）
const area = ref<HTMLTextAreaElement | null>(null);
const scrollTop = ref(0);
// 行の高さ（px）。CSS の --lh（スマホは字を 16px にして、入力のときに拡大されないようにする）を読む
const LH = ref(20);
function measure() {
  if (area.value) LH.value = parseFloat(getComputedStyle(area.value).lineHeight) || 20;
}
onMounted(() => {
  measure();
  window.addEventListener("resize", measure);
});
onBeforeUnmount(() => window.removeEventListener("resize", measure));

const lineCount = computed(() => model.value.split("\n").length);
const numbers = computed(() => Array.from({ length: lineCount.value }, (_, i) => i + 1).join("\n"));
const gutterCh = computed(() => Math.max(2, String(lineCount.value).length));

type Bar = { line: number; kind: "current" | "previous" | "next" | "error" };
const bars = computed<Bar[]>(() => {
  const out: Bar[] = props.errors.map((line) => ({ line, kind: "error" as const }));
  if (props.previous !== null && props.previous !== props.current) out.push({ line: props.previous, kind: "previous" });
  if (props.next !== null && props.next !== props.current) out.push({ line: props.next, kind: "next" });
  if (props.current !== null) out.push({ line: props.current, kind: "current" });
  return out;
});

function onScroll() {
  if (area.value) scrollTop.value = area.value.scrollTop;
}
watch(
  () => props.revealKey,
  async () => {
    await nextTick();
    const el = area.value;
    if (!el || props.current === null) return;
    const top = PAD + (props.current - 1) * LH.value;
    if (top < el.scrollTop + LH.value || top > el.scrollTop + el.clientHeight - 2 * LH.value) {
      el.scrollTop = Math.max(0, top - el.clientHeight / 3);
      onScroll();
    }
  },
);
</script>

<template>
  <div
    class="editor"
    :style="{ '--gutter': gutterCh + 1.6 + 'ch' }"
  >
    <div
      class="gutter"
      aria-hidden="true"
    >
      <div
        class="layer"
        :style="{ transform: `translateY(${-scrollTop}px)` }"
      >
        <div
          v-for="b in bars"
          :key="b.kind + b.line"
          class="gbar"
          :class="b.kind"
          :style="{ top: PAD + (b.line - 1) * LH + 'px' }"
        />
        <pre class="numbers">{{ numbers }}</pre>
      </div>
    </div>
    <div class="body">
      <div
        class="layer"
        aria-hidden="true"
        :style="{ transform: `translateY(${-scrollTop}px)` }"
      >
        <div
          v-for="b in bars"
          :key="b.kind + b.line"
          class="bar"
          :class="b.kind"
          :style="{ top: PAD + (b.line - 1) * LH + 'px' }"
        />
      </div>
      <textarea
        ref="area"
        v-model="model"
        class="input"
        wrap="off"
        placeholder="your code here!!"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        aria-label="code"
        @scroll="onScroll"
      />
    </div>
  </div>
</template>

<style scoped>
.editor {
  --lh: 20px;
  display: flex;
  position: relative;
  height: 260px;
  min-height: 120px;
  overflow: hidden;
  resize: vertical;
  background: var(--bg-side);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: var(--lh);
}
.editor:focus-within {
  border-color: var(--accent);
}
.gutter {
  position: relative;
  flex: none;
  width: var(--gutter);
  overflow: hidden;
  border-right: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink-faint);
  user-select: none;
}
.numbers {
  /* 印（絶対位置の帯）より上に番号を描く */
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 8px 0.6ch 8px 0;
  font: inherit;
  text-align: right;
}
.body {
  position: relative;
  flex: 1;
  min-width: 0;
}
.layer {
  position: absolute;
  inset: 0 0 auto 0;
  pointer-events: none;
}
.gutter .layer {
  position: relative;
}
.bar,
.gbar {
  position: absolute;
  left: 0;
  right: 0;
  height: var(--lh);
}
.bar.current {
  background: var(--accent-soft);
  box-shadow: inset 3px 0 0 var(--accent);
}
.bar.previous {
  background: rgba(141, 156, 171, 0.1);
  box-shadow: inset 3px 0 0 var(--ink-faint);
}
.bar.next {
  box-shadow: inset 0 0 0 1px var(--line-strong);
}
.bar.error {
  background: var(--bad-soft);
  box-shadow: inset 3px 0 0 var(--bad);
}
.gbar.current {
  background: var(--accent-soft);
  box-shadow: inset -3px 0 0 var(--accent);
}
.gbar.previous {
  background: var(--surface-3);
}
.gbar.error {
  background: var(--bad-soft);
}
.gbar.next {
  box-shadow: inset 0 0 0 1px var(--line-strong);
}
.input {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 8px 10px;
  background: transparent;
  border: 0;
  outline: none;
  color: var(--ink);
  font: inherit;
  line-height: var(--lh);
  white-space: pre;
  overflow: auto;
  resize: none;
}
@media (max-width: 600px) {
  .editor {
    --lh: 22px;
    font-size: 16px;
    height: 220px;
  }
}
.input::placeholder {
  color: var(--ink-faint);
}
</style>

<script setup lang="ts">
// ミノの形と、マスに書かれた命令（":" のとき）の図
import { computed } from "vue";
import { rotations } from "../placement";

const props = withDefaults(defineProps<{ mino: string; rot?: number; cell?: number; blank?: boolean }>(), { rot: 0, cell: 22, blank: false });

const cells = computed(() => {
  const shape = rotations[props.rot][props.mino] ?? {};
  const list = Object.keys(shape).map((k) => {
    const n = Number(k);
    return { x: n % 4, y: Math.floor(n / 4), ch: shape[n] };
  });
  const minX = Math.min(...list.map((c) => c.x));
  const minY = Math.min(...list.map((c) => c.y));
  return list.map((c) => ({ ...c, x: c.x - minX, y: c.y - minY }));
});
const w = computed(() => (Math.max(...cells.value.map((c) => c.x)) + 1) * props.cell);
const h = computed(() => (Math.max(...cells.value.map((c) => c.y)) + 1) * props.cell);
</script>

<template>
  <svg
    class="mino"
    :width="w"
    :height="h"
    :viewBox="`0 0 ${w} ${h}`"
    role="img"
    :aria-label="`${mino} ミノ`"
  >
    <g
      v-for="(c, i) in cells"
      :key="i"
    >
      <rect
        :x="c.x * cell + 1"
        :y="c.y * cell + 1"
        :width="cell - 2"
        :height="cell - 2"
        rx="2"
        :class="{ cmd: !blank && c.ch !== 'X' }"
      />
      <text
        v-if="!blank && c.ch !== 'X'"
        :x="c.x * cell + cell / 2"
        :y="c.y * cell + cell / 2 + 1"
      >{{ c.ch }}</text>
    </g>
  </svg>
</template>

<style scoped>
.mino {
  display: block;
  overflow: visible;
}
rect {
  fill: var(--surface-3);
  stroke: var(--line-strong);
}
rect.cmd {
  fill: var(--ink-soft);
  stroke: var(--ink-soft);
}
text {
  fill: var(--bg-side);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>

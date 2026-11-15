<script setup lang="ts">
// 「Try」の画面。動き（いつ実行系を新しく作るか・1000 ステップ・タブを移ったときに盤面を消す）は元の版（src/components/Tetris.vue）と同じ。
import { nextTick, onMounted, ref, shallowRef, watch } from "vue";
import AppIcon from "./AppIcon.vue";
import { TetrisInterpreter, tetriminos } from "../tetriscore";
import { exampleCodes } from "../staticcode";

const props = defineProps<{ active: boolean }>();

// 盤面の座標は元の版のまま（640x640 の上に描く。表示の大きさは CSS で決める）
const canvasWidth = 640;
const canvasHeight = 640;
const canvas = ref<HTMLCanvasElement | null>(null);
const executed = ref(false);
const code = ref("");
const stdin = ref("");
const stdout = ref("");
const debugMessage = ref("");
const core = shallowRef(new TetrisInterpreter("", ""));

function trySample() {
  code.value = exampleCodes[0];
  stdin.value = "sample cat program input";
}
function executeAllStep() {
  for (let i = 0; i < 1000; i++) execute1Step();
}
function execute1Step() {
  if (!executed.value) {
    core.value = new TetrisInterpreter(code.value, stdin.value);
    if (core.value.errorMessage) {
      debugMessage.value = core.value.errorMessage;
      return;
    }
    executed.value = true;
  }
  const res = core.value.execute1Step();
  if (res !== "") stdout.value = stdout.value + res;
  debugMessage.value = core.value.stateMessage;
  draw(core.value.state);
}

// 色と字はページのトークン（src/style.css）から読む
function palette() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    line: v("--line-strong"),
    ink: v("--ink-sub"),
    label: v("--ink-soft"),
    empty: v("--surface-2"),
    filled: v("--ink-soft"),
    filledInk: v("--bg-side"),
    mono: v("--font-mono"),
  };
}
type Palette = ReturnType<typeof palette>;

function drawConst(ctx: CanvasRenderingContext2D, p: Palette) {
  ctx.font = `30px ${p.mono}`;
  // 4x4
  // 0123
  // 4567
  // 89ab
  const tiles = tetriminos;
  let i = 0;
  ctx.strokeStyle = p.line;
  ctx.fillStyle = p.ink;
  for (const key in tiles) {
    for (const num in tiles[key]) {
      const n = parseInt(num);
      const x = (n % 4) * 35;
      const y = Math.floor(n / 4) * 35;
      ctx.strokeRect(380 + x, 90 * i + y, 30, 30);
      const str = tiles[key][num];
      if (str !== "X") ctx.fillText(str, 380 + x + 5, 90 * i + y + 25);
    }
    ctx.fillStyle = p.label;
    ctx.fillText(`[${key}]`, 530, 90 * i + 60);
    ctx.fillStyle = p.ink;
    i++;
  }
  ctx.strokeRect(360, 10, 240, 20 + 30 * 20);
}
function draw(state: Array<Array<string>>) {
  const el = canvas.value;
  if (!el) return;
  const ctx = el.getContext("2d");
  if (ctx === null) return;
  // 高精細の画面でもにじまないように、画素の数だけ大きく描く
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  if (el.width !== canvasWidth * dpr) {
    el.width = canvasWidth * dpr;
    el.height = canvasHeight * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const p = palette();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.lineWidth = 1;
  drawConst(ctx, p);
  ctx.strokeStyle = p.line;
  ctx.strokeRect(10, 10, 20 + 30 * 10, 20 + 30 * 20);
  ctx.font = `25px ${p.mono}`;
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 20; y++) {
      const isInValid = !state || !state[x] || !state[x][y];
      ctx.fillStyle = isInValid ? p.empty : p.filled;
      ctx.fillRect(20 + 30 * x, 20 + 30 * y, 27, 27);
      if (isInValid) continue;
      ctx.fillStyle = p.filledInk;
      ctx.fillText(state[x][y], 25 + 30 * x, 42 + 30 * y);
    }
  }
}

// 元の版は「Try」の画面にいるときだけ（コードの欄があるときだけ）新しく作る。この画面は隠すだけで残すので active で見る
function reset() {
  if (!props.active) return;
  executed.value = false;
  stdout.value = "";
  draw([]);
}
watch(stdin, reset);
watch(code, reset);
watch(
  () => props.active,
  () => nextTick(() => draw([])),
);
onMounted(() => {
  if (props.active) draw([]);
});
</script>

<template>
  <section class="panel try">
    <div class="panel-head">
      <h2>Try Tetris Esolang Now !!</h2>
      <button
        type="button"
        class="btn"
        @click="trySample"
      >
        <AppIcon name="code" />
        Try Sample
      </button>
    </div>
    <div class="cols">
      <div class="board">
        <canvas
          ref="canvas"
          :width="canvasWidth"
          :height="canvasHeight"
          aria-label="テトリスフィールドとテトリミノの命令"
          role="img"
        />
      </div>
      <div class="side">
        <div class="actions">
          <button
            type="button"
            class="btn btn-primary"
            @click="execute1Step"
          >
            <AppIcon name="play" />
            Execute 1 Step
          </button>
          <button
            type="button"
            class="btn"
            @click="executeAllStep"
          >
            <AppIcon name="forward" />
            Execute 1000 Steps
          </button>
        </div>
        <label class="field">
          <span class="field-label">code</span>
          <textarea
            v-model="code"
            class="textarea code"
            placeholder="your code here!!"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
          />
        </label>
        <label class="field">
          <span class="field-label">stdin</span>
          <textarea
            v-model="stdin"
            class="textarea"
            placeholder="standard input"
            spellcheck="false"
            autocapitalize="off"
          />
        </label>
        <label class="field">
          <span class="field-label">stdout</span>
          <textarea
            v-model="stdout"
            class="textarea"
            placeholder="standard output"
            readonly
          />
        </label>
        <label class="field">
          <span class="field-label">debug</span>
          <textarea
            v-model="debugMessage"
            class="textarea"
            placeholder="debug message"
            readonly
          />
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-head h2 {
  font-size: 1rem;
}
.cols {
  display: grid;
  gap: 16px;
}
.board canvas {
  display: block;
  width: 100%;
  max-width: 560px;
  height: auto;
  aspect-ratio: 1;
  margin: 0 auto;
  background: var(--bg-side);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}
.side {
  display: grid;
  align-content: start;
  gap: 12px;
  min-width: 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.actions .btn {
  flex: 1 1 auto;
}
.textarea.code {
  min-height: 140px;
}
@media (min-width: 860px) {
  .cols {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
}
</style>

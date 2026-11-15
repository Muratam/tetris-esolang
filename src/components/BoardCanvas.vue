<script setup lang="ts">
// 盤面（左）とミノの命令の一覧（右）。座標は元の版のまま（640x640 の上に描く。表示の大きさは CSS で決める）。
// 1 ステップごとに「出現 → 操作して落ちる → 置かれる → そろった行が光って消える → 詰まる」を短く動かして見せ、
// 動いた後は、前の盤面から変わったマスを枠で示す。prefers-reduced-motion のときと、速さが「最速」のときは動かさない。
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { tetriminos } from "../tetriscore";
import { poseCells, type Cell, type Grid } from "../placement";
import type { StepInfo } from "../runner";

const props = defineProps<{
  /** いまの盤面（実行系の state） */
  grid: Grid | null;
  /** 最後のステップの詳細（変わったマスの強調とアニメーションに使う） */
  step: StepInfo | null;
  /** アニメーションの長さ（ミリ秒。0 なら動かさない） */
  animMs: number;
  /** 増えたらアニメーションを始める（同じステップを再描画するだけのときは増やさない） */
  animKey: number;
}>();

const W = 640;
const H = 640;
const canvas = ref<HTMLCanvasElement | null>(null);
let raf = 0;
const reduced = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

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
    accent: v("--accent"),
    accentInk: v("--accent-ink"),
    accentSoft: v("--accent-soft"),
    bad: v("--bad"),
    mono: v("--font-mono"),
  };
}
type Palette = ReturnType<typeof palette>;

function context() {
  const el = canvas.value;
  if (!el) return null;
  const ctx = el.getContext("2d");
  if (!ctx) return null;
  // 高精細の画面でもにじまないように、画素の数だけ大きく描く
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  if (el.width !== W * dpr) {
    el.width = W * dpr;
    el.height = H * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawLegend(ctx: CanvasRenderingContext2D, p: Palette, active: string | null) {
  ctx.font = `30px ${p.mono}`;
  const tiles = tetriminos;
  let i = 0;
  for (const key in tiles) {
    const on = key === active;
    if (on) {
      ctx.fillStyle = p.accentSoft;
      const top = Math.max(11, 90 * i - 4);
      ctx.fillRect(361, top, 238, 90 * i + 80 - top);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = on ? p.accent : p.line;
    for (const num in tiles[key]) {
      const n = parseInt(num);
      const x = (n % 4) * 35;
      const y = Math.floor(n / 4) * 35;
      ctx.strokeRect(380 + x, 90 * i + y, 30, 30);
      const str = tiles[key][num];
      ctx.fillStyle = on ? p.accent : p.ink;
      if (str !== "X") ctx.fillText(str, 380 + x + 5, 90 * i + y + 25);
    }
    ctx.fillStyle = on ? p.accent : p.label;
    ctx.fillText(`[${key}]`, 530, 90 * i + 60);
    i++;
  }
  ctx.strokeStyle = p.line;
  ctx.strokeRect(360, 10, 240, 20 + 30 * 20);
}

type Mark = { cells?: Cell[]; changed?: [number, number][]; rows?: number[]; rowAlpha?: number; piece?: Cell[]; blocked?: Cell[] };

function drawBoard(ctx: CanvasRenderingContext2D, p: Palette, grid: Grid | null, mark: Mark) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = p.line;
  ctx.strokeRect(10, 10, 20 + 30 * 10, 20 + 30 * 20);
  ctx.font = `25px ${p.mono}`;
  const placed = new Set((mark.cells ?? []).map((c) => c.x * 100 + c.y));
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 20; y++) {
      const v = grid && grid[x] ? grid[x][y] : "";
      const on = placed.has(x * 100 + y);
      ctx.fillStyle = !v ? p.empty : on ? p.accent : p.filled;
      ctx.fillRect(20 + 30 * x, 20 + 30 * y, 27, 27);
      if (!v) continue;
      ctx.fillStyle = on ? p.accentInk : p.filledInk;
      ctx.fillText(v, 25 + 30 * x, 42 + 30 * y);
    }
  }
  // そろって消える行
  if (mark.rows && mark.rows.length) {
    ctx.save();
    ctx.globalAlpha = mark.rowAlpha ?? 1;
    for (const y of mark.rows) {
      ctx.fillStyle = p.accent;
      ctx.fillRect(16, 16 + 30 * y, 30 * 10 + 4, 34);
      ctx.fillStyle = p.accentInk;
      ctx.font = `bold 25px ${p.mono}`;
      for (let x = 0; x < 10; x++) {
        const v = grid && grid[x] ? grid[x][y] : "";
        if (v && v !== " ") ctx.fillText(v, 25 + 30 * x, 42 + 30 * y);
      }
    }
    ctx.restore();
  }
  // 動いている途中のミノ
  for (const c of mark.piece ?? []) {
    if (c.y < 0 || c.y > 19) continue;
    ctx.fillStyle = p.accent;
    ctx.fillRect(20 + 30 * c.x, 20 + 30 * c.y, 27, 27);
    if (c.ch.trim()) {
      ctx.fillStyle = p.accentInk;
      ctx.font = `25px ${p.mono}`;
      ctx.fillText(c.ch, 25 + 30 * c.x, 42 + 30 * c.y);
    }
  }
  // 前の盤面から変わったマス
  ctx.lineWidth = 2;
  ctx.strokeStyle = p.accent;
  for (const [x, y] of mark.changed ?? []) ctx.strokeRect(19 + 30 * x, 19 + 30 * y, 29, 29);
  // 出現の位置に置けなかったミノ
  ctx.strokeStyle = p.bad;
  for (const c of mark.blocked ?? []) ctx.strokeRect(19 + 30 * c.x, 19 + 30 * c.y, 29, 29);
}

function changedCells(before: Grid, after: Grid): [number, number][] {
  const out: [number, number][] = [];
  if (!before.length) return out;
  for (let x = 0; x < 10; x++) for (let y = 0; y < 20; y++) if (after[x][y] !== before[x][y] && after[x][y] !== "") out.push([x, y]);
  return out;
}

function frame(grid: Grid | null, mark: Mark, active: string | null) {
  const ctx = context();
  if (!ctx) return;
  const p = palette();
  ctx.clearRect(0, 0, W, H);
  drawLegend(ctx, p, active);
  drawBoard(ctx, p, grid, mark);
}

/** 動いた後の絵: いまの盤面と、前から変わったマス */
function drawStatic() {
  const s = props.step;
  if (!s || !props.grid) return frame(props.grid, {}, null);
  const pl = s.placement;
  const mark: Mark = { changed: changedCells(s.before, props.grid) };
  if (pl && pl.blocked && s.mino) mark.blocked = poseCells(s.mino, pl.path[0], true);
  frame(props.grid, mark, s.mino);
}

function animate() {
  cancelAnimationFrame(raf);
  const s = props.step;
  const pl = s?.placement;
  const dur = reduced?.matches ? 0 : props.animMs;
  if (!s || !pl || pl.blocked || !s.mino || dur <= 0) {
    raf = 0;
    return drawStatic();
  }
  const mino = s.mino;
  const useOrder = pl.cells.some((c) => c.ch.trim() !== "");
  const hasClear = pl.clearedRows.length > 0;
  // 時間の配分: 落ちる 45%・置く 15%・行が光る 25%・詰まる 15%（消える行が無ければ落ちる・置くを長く）
  const tMove = dur * (hasClear ? 0.45 : 0.65);
  const tLand = dur * (hasClear ? 0.6 : 1);
  const tClear = dur * 0.85;
  const t0 = performance.now();
  const tick = (now: number) => {
    const t = Math.max(0, now - t0);
    if (t < tMove) {
      const i = Math.min(pl.path.length - 1, Math.floor((t / tMove) * pl.path.length));
      frame(s.before, { piece: poseCells(mino, pl.path[i], useOrder) }, mino);
    } else if (t < tLand) {
      frame(pl.placed, { cells: pl.cells }, mino);
    } else if (hasClear && t < tClear) {
      const k = (t - tLand) / (tClear - tLand);
      frame(pl.placed, { cells: pl.cells, rows: pl.clearedRows, rowAlpha: 0.55 + 0.45 * Math.abs(Math.sin(k * Math.PI * 2)) }, mino);
    } else if (t < dur) {
      frame(props.grid, { changed: changedCells(s.before, props.grid ?? s.after) }, mino);
    } else {
      raf = 0;
      return drawStatic();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

watch(() => props.animKey, animate);
watch(
  () => [props.grid, props.step],
  () => {
    if (!raf) drawStatic();
  },
);
/** アニメーションを止めて、いまの絵を描く（タブを移って戻ったときなど） */
function redraw() {
  cancelAnimationFrame(raf);
  raf = 0;
  drawStatic();
}
defineExpose({ redraw });
onMounted(redraw);
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <canvas
    ref="canvas"
    class="board-canvas"
    :width="W"
    :height="H"
    role="img"
    aria-label="テトリスフィールドと、テトリミノに書かれた命令の一覧"
  />
</template>

<style scoped>
.board-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  background: var(--bg-side);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}
</style>

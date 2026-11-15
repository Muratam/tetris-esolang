<script setup lang="ts">
// 「Try」の画面。元の版と同じ枠（Try Sample・Execute 1 Step・Execute 1000 Steps・code・stdin・stdout・debug）に、
// 動きを追うためのもの（アニメーション・行の印・debug の表・戻る・速さを選べる連続実行）を足した。
// 実行系の呼び方は元の版と同じ（エラーがあれば実行しない。code か stdin を変えたら最初から）。
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import AppIcon from "./AppIcon.vue";
import BoardCanvas from "./BoardCanvas.vue";
import CodeEditor from "./CodeEditor.vue";
import DebugTable from "./DebugTable.vue";
import { Runner } from "../runner";
import { errorLines } from "../lines";
import { samples } from "../samples";
import { app, type Speed } from "../store";

const props = defineProps<{ active: boolean }>();

const runner = shallowRef<Runner | null>(null);
/** Runner は reactive ではないので、変えたら増やして再描画する */
const tick = ref(0);
const animKey = ref(0);
const revealKey = ref(0);
const animMs = ref(0);
const stdout = ref("");
const debugMessage = ref("");
const playing = ref(false);
const board = ref<InstanceType<typeof BoardCanvas> | null>(null);

const speeds: { id: Speed; label: string; interval: number; anim: number }[] = [
  { id: "slow", label: "ゆっくり", interval: 1100, anim: 900 },
  { id: "normal", label: "ふつう", interval: 480, anim: 400 },
  { id: "fast", label: "速い", interval: 140, anim: 110 },
  { id: "max", label: "最速", interval: 0, anim: 0 },
];
const speed = computed(() => speeds.find((s) => s.id === app.speed) ?? speeds[1]);

const view = computed(() => {
  void tick.value;
  const r = runner.value;
  return {
    steps: r ? r.steps : 0,
    status: r ? r.status : ("idle" as const),
    step: r ? r.last : null,
    grid: r ? r.interp.state.map((c) => c.slice()) : null,
    peek: r ? r.peek() : null,
    nextLine: r ? r.nextLine() : null,
    current: r ? r.lastLine : null,
    previous: r ? r.previousLine : null,
    errors: r ? errorLines(r.error) : [],
  };
});
const ended = computed(() => ["error", "finished", "halted"].includes(view.value.status));

/** 元の版の executed と同じ: 最初のステップで実行系を作る */
function ensure(): Runner {
  if (!runner.value) runner.value = new Runner(app.code, app.stdin);
  return runner.value;
}
function sync(anim: number) {
  const r = runner.value;
  stdout.value = r ? r.stdout : "";
  if (r) debugMessage.value = r.debugMessage;
  animMs.value = anim;
  tick.value++;
  animKey.value++;
  revealKey.value++;
}

function trySample() {
  app.code = samples[0].code;
  app.stdin = samples[0].stdin;
}
function execute1Step() {
  stop();
  ensure().step();
  sync(speed.value.anim || 400);
}
function executeAllStep() {
  stop();
  ensure().run(1000);
  sync(0);
}
function back() {
  stop();
  const r = runner.value;
  if (!r || r.steps === 0) return;
  runner.value = r.steps > 1 ? Runner.replay(r.code, r.stdin, r.steps - 1) : null;
  if (!runner.value) {
    stdout.value = "";
    debugMessage.value = "";
    tick.value++;
    animKey.value++;
    return;
  }
  sync(0);
}
function first() {
  stop();
  runner.value = null;
  stdout.value = "";
  debugMessage.value = "";
  tick.value++;
  animKey.value++;
}

// 連続実行（一時停止つき）
let timer = 0;
function loop() {
  const r = ensure();
  const s = speed.value;
  if (s.id === "max") r.run(200);
  else r.step();
  sync(s.anim);
  if (ended.value || r.error) {
    playing.value = false;
    return;
  }
  timer = window.setTimeout(loop, s.interval || 16);
}
function play() {
  if (playing.value) return stop();
  if (ended.value) return;
  playing.value = true;
  loop();
}
function stop() {
  playing.value = false;
  clearTimeout(timer);
}
onBeforeUnmount(stop);

// 元の版と同じ: code か stdin を変えたら最初から
function reset() {
  stop();
  runner.value = null;
  stdout.value = "";
  tick.value++;
  animKey.value++;
}
watch(() => app.code, reset);
watch(() => app.stdin, reset);
watch(
  () => app.runRequest,
  async () => {
    await nextTick();
    reset();
    play();
  },
);
// タブを移って戻ったら、いまの盤面を再描画する（隠れている間は止める）
watch(
  () => props.active,
  async (on) => {
    if (!on) stop();
    await nextTick();
    board.value?.redraw();
  },
);

const summary = computed(() => {
  const s = view.value.step;
  if (view.value.status === "error") return "コードにエラーがあります（赤い行）。修正すると実行できます。";
  if (!s) return "「Execute 1 Step」で 1 手ずつ、「連続実行」で続けて動かせます。";
  if (s.line === null) return `${s.index} ステップ目: 次に置く行が無いので、何もしません。`;
  const pl = s.placement;
  if (!pl) return `${s.index} ステップ目: 実行は終わっています。`;
  if (pl.blocked) return `${s.index} ステップ目: ${s.line} 行目の ${s.mino} ミノが出現の位置に置けないので、終了します。`;
  let t = `${s.index} ステップ目: ${s.line} 行目の ${s.mino} ミノを置きました。`;
  if (pl.clearedRows.length) t += ` ${pl.clearedRows.length} 行そろって消え、「${pl.instructions || "（命令なし）"}」を実行。`;
  if (s.output) t += " 出力あり。";
  if (s.bomb) t += " B でフィールドを消去。";
  return t;
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
      <div class="left">
        <div class="controls">
          <div class="actions">
            <button
              type="button"
              class="btn btn-icon"
              title="最初へ"
              aria-label="最初へ"
              :disabled="!view.steps"
              @click="first"
            >
              <AppIcon name="first" />
            </button>
            <button
              type="button"
              class="btn btn-icon"
              title="1 ステップ戻る"
              aria-label="1 ステップ戻る"
              :disabled="!view.steps"
              @click="back"
            >
              <AppIcon name="back" />
            </button>
            <button
              type="button"
              class="btn btn-primary grow"
              @click="execute1Step"
            >
              <AppIcon name="play" />
              Execute 1 Step
            </button>
            <button
              type="button"
              class="btn grow"
              :aria-pressed="playing"
              :disabled="ended && !playing"
              @click="play"
            >
              <AppIcon :name="playing ? 'pause' : 'run'" />
              {{ playing ? "一時停止" : "連続実行" }}
            </button>
            <button
              type="button"
              class="btn grow"
              @click="executeAllStep"
            >
              <AppIcon name="forward" />
              Execute 1000 Steps
            </button>
          </div>
          <div
            class="speed"
            role="radiogroup"
            aria-label="連続実行の速さ"
          >
            <span class="quiet">速さ</span>
            <button
              v-for="s in speeds"
              :key="s.id"
              type="button"
              role="radio"
              class="seg"
              :aria-checked="app.speed === s.id"
              @click="app.speed = s.id"
            >
              {{ s.label }}
            </button>
            <span class="count num">{{ view.steps }} ステップ</span>
          </div>
        </div>
        <BoardCanvas
          ref="board"
          :grid="view.grid"
          :step="view.step"
          :anim-ms="animMs"
          :anim-key="animKey"
        />
        <p
          class="summary"
          aria-live="polite"
        >
          {{ summary }}
        </p>
        <div class="legend quiet">
          <span><i class="sw accent" />置いたミノ・変わったマス</span>
          <span><i class="sw row" />そろって消える行</span>
        </div>
      </div>
      <div class="side">
        <div class="field">
          <span class="field-label">code<span class="marks"><i class="mk current" />いま置いた行 <i class="mk previous" />直前の行 <i class="mk next" />次の行</span></span>
          <CodeEditor
            v-model="app.code"
            :current="view.current"
            :previous="view.previous"
            :next="ended ? null : view.nextLine"
            :errors="view.errors"
            :reveal-key="revealKey"
          />
        </div>
        <div class="io">
          <label class="field">
            <span class="field-label">stdin</span>
            <textarea
              v-model="app.stdin"
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
        </div>
        <div class="field">
          <span class="field-label">debug</span>
          <DebugTable
            class="dbg-box"
            :status="view.status"
            :steps="view.steps"
            :step="view.step"
            :peek="view.peek"
            :next-line="ended ? null : view.nextLine"
            :code="app.code"
            :stdin="app.stdin"
          />
          <textarea
            v-model="debugMessage"
            class="textarea raw"
            placeholder="debug message"
            readonly
            aria-label="debug message（実行系の出力のまま）"
          />
        </div>
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
.left {
  display: grid;
  align-content: start;
  gap: 8px;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}
.summary {
  min-height: 3.2em;
  font-size: 0.86rem;
  color: var(--ink-sub);
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 0.76rem;
}
.sw {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border-radius: 2px;
  vertical-align: -1px;
}
.sw.accent {
  background: var(--accent);
}
.sw.row {
  background: var(--accent);
  opacity: 0.55;
}
.side {
  display: grid;
  align-content: start;
  gap: 12px;
  min-width: 0;
}
.controls {
  display: grid;
  gap: 8px;
  margin-bottom: 4px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.actions .grow {
  flex: 1 1 auto;
}
.btn-icon {
  width: 40px;
  padding: 0;
}
.btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.speed {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
}
.speed > .quiet {
  margin-right: 4px;
}
.seg {
  min-height: 30px;
  padding: 2px 10px;
  background: none;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  color: var(--ink-soft);
  font: inherit;
  cursor: pointer;
}
.seg[aria-checked="true"] {
  background: var(--accent-soft);
  border-color: rgba(71, 200, 230, 0.45);
  color: var(--accent);
}
.count {
  margin-left: auto;
  color: var(--ink-soft);
}
.num {
  font-family: var(--font-mono);
}
.marks {
  margin-left: 10px;
  color: var(--ink-faint);
}
.mk {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 3px 0 8px;
  border-radius: 2px;
  vertical-align: -1px;
}
.mk.current {
  background: var(--accent-soft);
  box-shadow: inset 2px 0 0 var(--accent);
}
.mk.previous {
  background: var(--surface-3);
  box-shadow: inset 2px 0 0 var(--ink-faint);
}
.mk.next {
  box-shadow: inset 0 0 0 1px var(--line-strong);
}
.io {
  display: grid;
  gap: 12px;
}
.io .textarea {
  min-height: 72px;
}
.dbg-box {
  background: var(--bg-side);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}
.raw {
  min-height: 64px;
  margin-top: 4px;
  font-size: 0.78rem;
}
@media (min-width: 560px) {
  .io {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 900px) {
  .cols {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    align-items: start;
  }
  .left {
    position: sticky;
    top: calc(var(--bar-h) + 12px);
  }
}
</style>

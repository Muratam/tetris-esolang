<script setup lang="ts">
// debug の内容を表にしたもの（実行系の stateMessage と、実行系の中の値を読んだもの）
import { computed } from "vue";
import { instructionText } from "../ops";
import type { Peek } from "../inspect";
import type { Status, StepInfo } from "../runner";

const props = defineProps<{
  status: Status | "idle";
  steps: number;
  step: StepInfo | null;
  peek: Peek | null;
  nextLine: number | null;
  code: string;
  stdin: string;
}>();

const statusText = computed(
  () =>
    ({
      idle: "まだ実行していません",
      ready: "準備完了",
      running: "実行中",
      error: "エラー（実行できません）",
      finished: "終了: ミノが出現の位置に置けない（高さ 20 を超えた）",
      halted: "終了: 次に置く行が無い",
    })[props.status],
);
const srcLine = (n: number | null) => (n === null ? "" : (props.code.split("\n")[n - 1] ?? "").trim());
const visible = (s: string) =>
  [...s].map((c) => (c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127 ? `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}` : c)).join("");
const labelText = (l: number) => (l === Infinity ? "なし（先頭から）" : String(l));
const nextChar = computed(() => {
  const p = props.peek;
  if (!p) return "";
  return p.stdinPointer < props.stdin.length ? visible(props.stdin[p.stdinPointer]) : "EOF";
});
</script>

<template>
  <table class="dbg">
    <tbody>
      <tr>
        <th>状態</th>
        <td>
          <span
            class="state"
            :class="status"
          >{{ statusText }}</span>
          <span
            v-if="steps"
            class="quiet"
          > · {{ steps }} ステップ</span>
        </td>
      </tr>
      <tr>
        <th>置いた行</th>
        <td>
          <template v-if="step && step.line !== null">
            <span class="ln">{{ step.line }} 行目</span>
            <code>{{ srcLine(step.line) }}</code>
          </template>
          <span
            v-else
            class="quiet"
          >—</span>
        </td>
      </tr>
      <tr>
        <th>消えた行</th>
        <td>
          <template v-if="step && step.placement && step.placement.clearedRows.length">
            {{ step.placement.clearedRows.length }} 行 → R = {{ step.placement.clearedRows.length * 100 }} にして実行:
            <span class="ops">
              <span
                v-for="(c, i) in step.placement.instructions"
                :key="i"
                class="op"
                :title="instructionText[c]"
              >{{ c }}</span>
            </span>
            <span
              v-if="step.bomb"
              class="note"
            >B でフィールドを消去</span>
          </template>
          <span
            v-else
            class="quiet"
          >なし</span>
        </td>
      </tr>
      <tr>
        <th>出力</th>
        <td>
          <code v-if="step && step.output">{{ visible(step.output) }}</code>
          <span
            v-else
            class="quiet"
          >なし</span>
        </td>
      </tr>
      <tr>
        <th>次に置く行</th>
        <td>
          <template v-if="nextLine !== null">
            <span class="ln">{{ nextLine }} 行目</span>
            <code>{{ srcLine(nextLine) }}</code>
          </template>
          <span
            v-else
            class="quiet"
          >—</span>
          <span
            v-if="peek"
            class="quiet"
          > · ラベル {{ labelText(peek.label) }}</span>
        </td>
      </tr>
      <tr>
        <th>P（ポインタ）</th>
        <td><span class="num">{{ peek ? peek.pointer : 0 }}</span></td>
      </tr>
      <tr>
        <th>A（メモリ）</th>
        <td>
          <span
            v-if="peek && peek.store.length"
            class="mem"
          >
            <span
              v-for="[k, v] in peek.store"
              :key="k"
              class="cell"
              :class="{ at: k === peek.pointer }"
            >A[{{ k }}] = {{ v }}</span>
          </span>
          <span
            v-else
            class="quiet"
          >すべて 0</span>
        </td>
      </tr>
      <tr>
        <th>標準入力</th>
        <td>
          <span class="num">{{ peek ? peek.stdinPointer : 0 }} / {{ stdin.length }}</span> 文字を読んだ
          <span
            v-if="peek"
            class="quiet"
          > · 次: <code>{{ nextChar }}</code></span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.dbg {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;
}
.dbg th,
.dbg td {
  padding: 5px 8px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
.dbg tr:last-child th,
.dbg tr:last-child td {
  border-bottom: 0;
}
.dbg th {
  width: 8.5em;
  color: var(--ink-soft);
  font-weight: 600;
  white-space: nowrap;
}
.dbg td {
  overflow-wrap: anywhere;
}
code {
  padding: 0 5px;
  background: var(--surface-3);
  border-radius: 4px;
  font-size: 0.92em;
}
.ln {
  margin-right: 6px;
  color: var(--ink-sub);
}
.state.running,
.state.ready {
  color: var(--ok);
}
.state.error {
  color: var(--bad);
}
.state.finished,
.state.halted {
  color: var(--ink-sub);
}
.ops,
.mem {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  vertical-align: middle;
}
.op {
  min-width: 22px;
  padding: 0 5px;
  border: 1px solid rgba(71, 200, 230, 0.45);
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  text-align: center;
  cursor: help;
}
.cell {
  padding: 0 6px;
  border: 1px solid var(--line-strong);
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.92em;
}
.cell.at {
  border-color: var(--accent);
  color: var(--accent);
}
.note {
  margin-left: 6px;
  color: var(--warn);
}
.num {
  font-family: var(--font-mono);
}
</style>

// 画面の間で共有する状態（いまのページ・Try のコードと標準入力）。サンプルの「Try で開く」がここに書く
import { reactive } from "vue";
import type { Sample } from "./samples";

export type Page = "home" | "try" | "specification" | "example";
export type Speed = "slow" | "normal" | "fast" | "max";

export const app = reactive({
  page: "home" as Page,
  code: "",
  stdin: "",
  speed: "normal" as Speed,
  /** 増えたら Try が連続実行を始める */
  runRequest: 0,
});

export function openInTry(sample: Sample, run = false) {
  app.code = sample.code;
  app.stdin = sample.stdin;
  app.page = "try";
  if (run) {
    app.speed = sample.speed ?? "normal";
    app.runRequest++;
  }
  window.scrollTo({ top: 0 });
}

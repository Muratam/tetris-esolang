// 実行系（src/tetriscore.ts）のテスト。
// golden.json は、移す前の版（origin/master 71c27e5 の src/tetriscore.ts を typescript 2.9 で es5 に変換したもの）で
// 同じプログラムを動かした記録。移した後の版が、1 ステップごとの出力・盤面・メッセージまで一致することを確認する。
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { TetrisInterpreter } from "../src/tetriscore";
import { exampleCodes } from "../src/staticcode";
import { trace } from "./trace.js";

type Case = { name: string; code: string; stdin: string; steps: number; expected: ReturnType<typeof trace> };
const golden: { source: string; cases: Case[] } = JSON.parse(readFileSync(new URL("./golden.json", import.meta.url), "utf8"));

beforeAll(() => {
  // 実行系は不正な入力で console.assert を呼ぶ（元の版のまま）。テストの出力を埋めないように黙らせる
  vi.spyOn(console, "assert").mockImplementation(() => {});
});

describe("移す前の版と同じ動き（golden）", () => {
  it("golden の件数", () => {
    expect(golden.cases.length).toBeGreaterThanOrEqual(60);
  });
  for (const c of golden.cases) {
    it(c.name, () => {
      expect(trace(TetrisInterpreter, c.code, c.stdin, c.steps, c.expected.first.length)).toEqual(c.expected);
    });
  }
});

describe("実行系", () => {
  const run = (code: string, stdin: string, steps = 1000) => {
    const t = new TetrisInterpreter(code, stdin);
    let out = "";
    for (let i = 0; i < steps; i++) out += t.execute1Step();
    return { t, out };
  };

  it("サンプルの cat は標準入力をそのまま出す", () => {
    expect(run(exampleCodes[0], "sample cat program input").out).toBe("sample cat program input");
  });
  it("EOF で止まる cat", () => {
    const { out } = run(exampleCodes[2], "abc");
    expect(out).toBe("abc");
  });
  it("ラベルの重複はエラー", () => {
    expect(new TetrisInterpreter("1:\nI.\n1:\nO:", "").errorMessage).toBe("Error 3行目:ラベルが重複しています\n");
  });
  it("テトリミノと useOrder と操作の誤り", () => {
    expect(new TetrisInterpreter("X:", "").errorMessage).toContain("テトリミノはILJZSOTで指定してください");
    expect(new TetrisInterpreter("I;", "").errorMessage).toContain("useOrderが不定です");
    expect(new TetrisInterpreter("I.>x", "").errorMessage).toContain("操作が不定です");
  });
  it("高さ 20 を超えたら終了する", () => {
    const { t } = run(Array(30).fill("O:").join("\n"), "", 40);
    expect(t.finished).toBe(true);
  });
});

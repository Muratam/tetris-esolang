// 表示用のロジック（行の対応・置き方のコピー・実行の管理・サンプル）が、実行系と食い違わないことの確認。
// 実行系の結果そのものは interpreter.test.ts（golden）が確認する。
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { TetrisInterpreter, type CodeBlock } from "../src/tetriscore";
import { exampleCodes } from "../src/staticcode";
import { lineMap, sourceLine, errorLines } from "../src/lines";
import { place, cloneGrid, rotations } from "../src/placement";
import { peek } from "../src/inspect";
import { Runner } from "../src/runner";
import { samples, helloWorldFromScript } from "../src/samples";

type Case = { name: string; code: string; stdin: string; steps: number };
const golden: { cases: Case[] } = JSON.parse(readFileSync(new URL("./golden.json", import.meta.url), "utf8"));

beforeAll(() => {
  vi.spyOn(console, "assert").mockImplementation(() => {});
});

describe("行の対応（lineMap）", () => {
  it("実行系の parse と同じ並び（全 golden）", () => {
    for (const c of golden.cases) {
      const t = new TetrisInterpreter(c.code, c.stdin);
      const code = (t as unknown as { code: CodeBlock }).code;
      const map = lineMap(c.code);
      const src = c.code.split("\n");
      expect(Object.keys(map).sort(), c.name).toEqual(Object.keys(code).sort());
      for (const k of Object.keys(code)) {
        const ops = code[k as unknown as number];
        expect(map[k].length, c.name).toBe(ops.length);
        ops.forEach((op, i) => expect(src[map[k][i] - 1].replace(/\s/g, "")[0], `${c.name} ${k} ${i}`).toBe(op.blockType));
      }
    }
  });
  it("行番号を引く・エラーの行", () => {
    const map = lineMap("# c\n100:\nI.>>\n\nO:B");
    expect(sourceLine(map, 100, 0)).toBe(3);
    expect(sourceLine(map, 100, 1)).toBe(5);
    expect(sourceLine(map, Infinity, 0)).toBe(3);
    expect(sourceLine(map, 100, 2)).toBeNull();
    expect(errorLines("Error 1行目:a\nError 12行目:b\n")).toEqual([1, 12]);
  });
});

describe("置き方のコピー（placement）と実行の管理（Runner）", () => {
  it("回転 0 は実行系の tetriminos と同じ", () => {
    expect(Object.keys(rotations[0]).sort()).toEqual("IJLOSTZ".split(""));
  });
  it("1 ステップごとに、コピーで消した後の盤面が実行系の盤面と一致する（全 golden）", () => {
    let placements = 0;
    let clears = 0;
    for (const c of golden.cases) {
      const t = new TetrisInterpreter(c.code, c.stdin);
      for (let s = 0; s < Math.min(c.steps, 3000); s++) {
        const p = peek(t);
        const wasFinished = t.finished;
        const before = cloneGrid(t.state);
        t.execute1Step();
        if (wasFinished || !p.next) continue;
        const pl = place(before, p.next.blockType, p.next.useOrder, p.next.operation);
        if (pl.blocked) {
          expect(t.finished, c.name).toBe(true);
          expect(t.state, c.name).toEqual(before);
          continue;
        }
        placements++;
        if (pl.clearedRows.length) clears++;
        const empty = t.state.every((col) => col.every((x) => x === ""));
        // B（Bomb）が実行されるとフィールドは全部消える
        if (pl.instructions.includes("B") && empty) continue;
        expect(t.state, `${c.name} step ${s}`).toEqual(pl.cleared);
        if (pl.clearedRows.length) expect(t.stateMessage.startsWith(`execute [${pl.instructions}]`) || t.finished, c.name).toBe(true);
      }
    }
    expect(placements).toBeGreaterThan(5000);
    expect(clears).toBeGreaterThan(500);
  });
  it("Runner は実行系をそのまま呼ぶ（出力・盤面・debug が同じ）", () => {
    for (const c of golden.cases.slice(0, 20)) {
      const r = new Runner(c.code, c.stdin);
      const t = new TetrisInterpreter(c.code, c.stdin);
      let out = "";
      for (let s = 0; s < 200; s++) {
        r.step(s % 7 === 0);
        if (!t.errorMessage) out += t.execute1Step();
      }
      expect(r.stdout, c.name).toBe(out);
      if (!t.errorMessage) {
        expect(r.interp.state).toEqual(t.state);
        expect(r.debugMessage).toBe(t.stateMessage);
      } else {
        expect(r.debugMessage).toBe(t.errorMessage);
        expect(r.status).toBe("error");
      }
    }
  });
  it("戻る（最初からもう一度実行する）と同じ状態になる", () => {
    const r = new Runner(exampleCodes[0], "abc");
    r.run(30);
    const back = Runner.replay(exampleCodes[0], "abc", 29);
    back.step();
    expect(back.stdout).toBe(r.stdout);
    expect(back.interp.state).toEqual(r.interp.state);
    expect(back.lastLine).toBe(r.lastLine);
    expect(back.previousLine).toBe(r.previousLine);
  });
  it("いま置いた行と直前の行・次の行", () => {
    const r = new Runner(exampleCodes[0], "ab");
    expect(r.nextLine()).toBe(3);
    const s1 = r.step()!;
    expect(s1.line).toBe(3);
    expect(s1.mino).toBe("I");
    expect(r.nextLine()).toBe(4);
    r.step();
    expect(r.lastLine).toBe(4);
    expect(r.previousLine).toBe(3);
  });
  it("置く行が無くなったら halted、高さを超えたら finished", () => {
    const r = new Runner("I.\nI.", "");
    r.run(3);
    expect(r.status).toBe("halted");
    const f = new Runner(Array(30).fill("O:").join("\n"), "");
    f.run(40);
    expect(f.status).toBe("finished");
    expect(new Runner("X:", "").status).toBe("error");
  });
});

describe("サンプル", () => {
  it("仕様の例（cat）の説明のとおりに動く", () => {
    const r = new Runner(exampleCodes[0], "ab");
    const steps = Array.from({ length: 6 }, () => r.step()!);
    expect(steps.map((s) => s.line)).toEqual([3, 4, 5, 6, 7, 8]);
    expect(steps.slice(0, 3).every((s) => s.placement!.clearedRows.length === 0)).toBe(true);
    expect(steps[3].placement!.instructions).toBe("=IO");
    expect(steps[3].output).toBe("a");
    expect(steps[4].placement!.clearedRows.length).toBe(0);
    expect(steps[5].placement!.instructions.startsWith("JB")).toBe(true);
    expect(steps[5].bomb).toBe(true);
    expect(r.nextLine()).toBe(3);
  });
  it("Hello World の生成は utils/hello.py と同じ手順", () => {
    const code = helloWorldFromScript(exampleCodes[3]);
    const r = new Runner(code, "");
    expect(r.error).toBe("");
    for (let i = 0; i < 20000 && r.status !== "halted" && r.status !== "finished"; i++) r.step(false);
    expect(r.stdout).toBe("Hello, World!");
  });
  it("cat の例は入力を出力する（コメントつきの版は説明のとおり文字コード 1 を出す）", () => {
    const out = (id: string) => {
      const s = samples.find((x) => x.id === id)!;
      const r = new Runner(s.code, s.stdin);
      r.run(2000);
      expect(r.error).toBe("");
      return { r, s };
    };
    const cat = out("cat");
    expect(cat.r.stdout).toBe(cat.s.stdin);
    const eof = out("cat-eof");
    expect(eof.r.stdout).toBe(eof.s.stdin);
    const commented = out("cat-commented");
    expect(commented.r.stdout.length).toBeGreaterThan(0);
    expect([...commented.r.stdout].every((c) => c === "\u0001")).toBe(true);
    expect(exampleCodes[1].split("\n")[9]).toBe("I:AA<<<");
  });
});

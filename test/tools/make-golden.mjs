// golden.json を再生成するときのスクリプト（ふだんは使わない。golden は移す前の版の記録なので、再生成するのは golden の入力を足すときだけ）。
// 移す前の版の実行系を用意してから動かす:
//   git show 71c27e5:src/tetriscore.ts > <作業場所>/tetriscore.ts（staticcode.ts も同じ）
//   npx -p typescript@2.9.2 tsc --target es5 --lib es2015,dom --module commonjs --outDir <作業場所>/old <作業場所>/tetriscore.ts <作業場所>/staticcode.ts
//   echo '{"type":"commonjs"}' > <作業場所>/old/package.json
//   python3 utils/hello.py > <作業場所>/hello.tet
//   node test/tools/make-golden.mjs <作業場所>/old $PWD/test/trace.js <作業場所>/hello.tet test/golden.json
// 行が消えやすいプログラム（dense-*）は search-dense.mjs が作った found.json を読む（同じ <作業場所>/old に置く）。
// 今の版（origin/master 71c27e5 の src/tetriscore.ts を tsc 2.9 で es5 にしたもの）で golden を作る
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const [, , oldDir, traceJs, helloPath, outPath] = process.argv;
const require = createRequire(oldDir + "/");
const { TetrisInterpreter } = require(oldDir + "/tetriscore.js");
const { exampleCodes } = require(oldDir + "/staticcode.js");
const { trace } = await import(traceJs);
console.assert = () => {};

let seed = 20261115;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (s) => s[Math.floor(rnd() * s.length)];
const randInt = (a, b) => a + Math.floor(rnd() * (b - a + 1));
function randomProgram(lines) {
  const out = [];
  const labels = [100, 200, 300, -1, 0, 400, 500];
  for (let i = 0; i < lines; i++) {
    if (labels.length && rnd() < 0.05) { out.push(`${labels.splice(randInt(0, labels.length - 1), 1)[0]}:`); continue; }
    if (rnd() < 0.03) { out.push("# comment " + i); continue; }
    let ops = "";
    const rot = randInt(0, 3);
    ops += rot === 3 ? "B" : "A".repeat(rot);
    const n = randInt(0, 5);
    ops += (rnd() < 0.5 ? "<" : ">").repeat(n);
    if (rnd() < 0.15) ops += pick(["V", "^", "VV", "A", "B", "^>", "<<<<<<"]);
    out.push(`${pick("ILJZSOT")}${rnd() < 0.7 ? ":" : "."}${ops}`);
  }
  return out.join("\n");
}
const cases = [];
const ex = exampleCodes.slice(0, 3);
const stdins = ["sample cat program input", "", "Hello\nWorld\n", "あいう𝄞eÈz"];
ex.forEach((code, i) => stdins.forEach((stdin, j) => cases.push({ name: `example${i}-stdin${j}`, code, stdin, steps: 1000 })));
cases.push({ name: "example3-python", code: exampleCodes[3], stdin: "", steps: 50 });
cases.push({ name: "hello-world", code: readFileSync(helloPath, "utf8"), stdin: "", steps: 13000 });
const errs = {
  "error-duplicate-label": "100:\nI.\n100:\nO:",
  "error-bad-mino": "X:>>\nI.",
  "error-no-useorder": "I\nO:",
  "error-bad-useorder": "I;>>",
  "error-bad-op": "I.>>x<",
  "empty": "",
  "comments-only": "# a\n  # b\n",
  "inline-comment-and-space": "I . > > # move\nO : B\n  100 :\nJ:A<",
  "overflow": Array(30).fill("O:").join("\n"),
  "negative-label": "-1:\nI.\nO.\n-100:\nO:",
};
for (const [name, code] of Object.entries(errs)) cases.push({ name, code, stdin: "ab", steps: 60 });
for (let i = 0; i < 40; i++) {
  const stdin = Array.from({ length: randInt(0, 12) }, () => String.fromCharCode(randInt(32, 126))).join("");
  cases.push({ name: `random${i}`, code: randomProgram(randInt(20, 160)), stdin, steps: 400 });
}
// 行が消えやすいように選んだプログラム（search.mjs。命令の種類を網羅するため）
const found = JSON.parse(readFileSync(oldDir + "/found.json", "utf8"));
const seen = new Set();
for (const [op, code] of Object.entries(found)) { if (seen.has(code)) continue; seen.add(code); cases.push({ name: `dense-${op === "out" ? "output" : op}`, code, stdin: "xyz", steps: 60 }); }
const ops = new Set();
const result = cases.map((c) => {
  const r = trace(TetrisInterpreter, c.code, c.stdin, c.steps, 6);
  // 実行された命令の種類（網羅の目安。golden には入れない）
  const t = new TetrisInterpreter(c.code, c.stdin);
  for (let i = 0; i < c.steps; i++) { t.execute1Step(); const m = /^execute \[(.*)\]/.exec(t.stateMessage); if (m) for (const ch of m[1]) ops.add(ch); }
  return { ...c, expected: r };
});
writeFileSync(outPath, JSON.stringify({ source: "Muratam/tetris-esolang 71c27e5 src/tetriscore.ts（typescript 2.9.2 で es5 に変換）", cases: result }, null, 1) + "\n");
console.log("cases", result.length, "ops", [...ops].sort().join(""));
for (const r of result) console.log(r.name, JSON.stringify(r.expected.stdout).slice(0, 60), r.expected.finished, JSON.stringify(r.expected.errorMessage).slice(0, 60), r.expected.first.length);

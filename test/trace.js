// 実行系の動きを記録する（golden を作るときと、テストで照合するときに同じものを使う）。
// 1 ステップごとに「返した出力・stateMessage・finished・盤面」を順に sha256 に流し、
// 最初の数ステップと最後の状態はそのまま残す（食い違ったときにどこからずれたか分かるように）。
import { createHash } from "node:crypto";

/** 盤面（state[x][y]、空は ""）を 20 行の文字列にする。空は "."、中身の無いミノ（" "）は "_" */
export function fieldRows(state) {
  const rows = [];
  for (let y = 0; y < 20; y++) {
    let row = "";
    for (let x = 0; x < 10; x++) {
      const c = state[x][y];
      row += c === "" ? "." : c === " " ? "_" : c;
    }
    rows.push(row);
  }
  return rows;
}

export function trace(Interpreter, code, stdin, steps, firstSteps = 12) {
  const t = new Interpreter(code, stdin);
  const hash = createHash("sha256");
  const first = [];
  let stdout = "";
  for (let i = 0; i < steps; i++) {
    const out = t.execute1Step();
    stdout += out;
    hash.update(JSON.stringify([out, t.stateMessage, t.finished, t.state]) + "\n");
    if (i < firstSteps) first.push({ out, stateMessage: t.stateMessage, finished: t.finished, field: fieldRows(t.state).join("\n") });
  }
  return {
    errorMessage: t.errorMessage,
    stdout,
    finished: t.finished,
    stateMessage: t.stateMessage,
    field: fieldRows(t.state),
    first,
    hash: hash.digest("hex"),
  };
}

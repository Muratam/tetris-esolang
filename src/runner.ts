// Try の実行の管理（画面から使う）。実行系（tetriscore.ts）はそのまま呼ぶだけで、
// 1 ステップごとに「どの行を置いたか・どう動いたか・どの行が消えて何を実行したか」を表示用に集める。
// ステップを戻るときは、最初から同じ回数だけもう一度実行する（実行系は決定的なので同じ状態になる）。
import { TetrisInterpreter } from "./tetriscore";
import { peek, type Peek } from "./inspect";
import { lineMap, sourceLine, type LineMap } from "./lines";
import { cloneGrid, place, type Grid, type Placement } from "./placement";

export type StepInfo = {
  /** 何ステップ目か（1 始まり） */
  index: number;
  /** 置いた行（ソースの行番号。置く行が無かったら null） */
  line: number | null;
  mino: string | null;
  placement: Placement | null;
  before: Grid;
  after: Grid;
  output: string;
  /** フィールドが B（Bomb）で消えた */
  bomb: boolean;
};

export type Status = "ready" | "running" | "error" | "finished" | "halted";

export class Runner {
  readonly code: string;
  readonly stdin: string;
  readonly lines: LineMap;
  interp: TetrisInterpreter;
  steps = 0;
  stdout = "";
  debugMessage = "";
  last: StepInfo | null = null;
  /** 最後に置いた行と、その 1 つ前に置いた行（ソースの行番号） */
  lastLine: number | null = null;
  previousLine: number | null = null;
  halted = false;

  constructor(code: string, stdin: string) {
    this.code = code;
    this.stdin = stdin;
    this.lines = lineMap(code);
    this.interp = new TetrisInterpreter(code, stdin);
  }

  get error(): string {
    return this.interp.errorMessage;
  }
  get status(): Status {
    if (this.error) return "error";
    if (this.interp.finished) return "finished";
    if (this.halted) return "halted";
    return this.steps === 0 ? "ready" : "running";
  }
  peek(): Peek {
    return peek(this.interp);
  }
  /** 次に置く行（ソースの行番号） */
  nextLine(): number | null {
    const p = this.peek();
    return p.next ? sourceLine(this.lines, p.label, p.counter) : null;
  }

  /** 元の版の「Execute 1 Step」と同じ: エラーがあれば実行せず、debug にエラーを出す */
  step(detail = true): StepInfo | null {
    if (this.error) {
      this.debugMessage = this.error;
      return null;
    }
    const wasFinished = this.interp.finished;
    const p = this.peek();
    const next = wasFinished ? null : p.next;
    const line = next ? sourceLine(this.lines, p.label, p.counter) : null;
    const before = detail ? cloneGrid(this.interp.state) : null;
    const res = this.interp.execute1Step();
    this.steps++;
    if (res !== "") this.stdout += res;
    this.debugMessage = this.interp.stateMessage;
    if (!wasFinished && !next) this.halted = true;
    if (line !== null) {
      this.previousLine = this.lastLine;
      this.lastLine = line;
    }
    if (!before) return null;
    // 出現の位置に置けなかったときは、実行系が finished にして盤面はそのまま
    const placement = next ? place(before, next.blockType, next.useOrder, next.operation) : null;
    const after = cloneGrid(this.interp.state);
    const bomb = !!placement && !placement.blocked && placement.instructions.includes("B") && after.every((col) => col.every((c) => c === ""));
    this.last = { index: this.steps, line, mino: next ? next.blockType : null, placement, before, after, output: res, bomb };
    return this.last;
  }

  /** n 回まとめて実行し、最後の 1 回だけ詳しく記録する */
  run(n: number): StepInfo | null {
    let info: StepInfo | null = null;
    for (let i = 0; i < n; i++) {
      info = this.step(i === n - 1);
      if (this.error) break;
    }
    return info;
  }

  /** 最初から n ステップ実行した状態を作る（ステップを戻るとき） */
  static replay(code: string, stdin: string, n: number): Runner {
    const r = new Runner(code, stdin);
    if (n > 0) r.run(n);
    return r;
  }
}

// 実行系（tetriscore.ts）の中の値を、画面に見せるために読むだけ（書かない）。
// 実行系は変えない決まりなので、private のフィールドを型の上だけで開いて読む。
// フィールドの名前が変わったら test/viewer.test.ts が落ちる。
import type { CodeBlock, OperationLine, TetrisInterpreter } from "./tetriscore";

type Internals = {
  pointer: number;
  store: { [key: number]: number };
  stdinpointer: number;
  stdin: string;
  code: CodeBlock;
  counter: number;
  label: number;
};

export type Peek = {
  pointer: number;
  store: [number, number][];
  stdinPointer: number;
  stdinLength: number;
  counter: number;
  label: number;
  /** 次に置く行（無ければ null） */
  next: OperationLine | null;
};

export function peek(t: TetrisInterpreter): Peek {
  const i = t as unknown as Internals;
  const block = i.code ? i.code[i.label] : undefined;
  return {
    pointer: i.pointer,
    store: Object.keys(i.store).map((k) => [Number(k), i.store[Number(k)]]),
    stdinPointer: i.stdinpointer,
    stdinLength: i.stdin.length,
    counter: i.counter,
    label: i.label,
    next: (block && block[i.counter]) || null,
  };
}

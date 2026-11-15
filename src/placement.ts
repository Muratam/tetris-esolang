// 1 ステップの中でミノがどう動いて置かれ、どの行が消えるかを、画面に見せるために計算する（表示用）。
// 実行系（tetriscore.ts）の execute1Step の前半（出現・操作・設置・行の消去）と同じ規則のコピー。
// 実行系の結果は変えない。コピーが実行系と食い違わないことは test/viewer.test.ts が golden の全プログラムで確認する。
import { tetriminos } from "./tetriscore";

export type Grid = string[][]; // [x][y]。空は ""、中身の無いミノのマスは " "

// 回転ごとのミノの形（4x4 の番号 → 文字）。0 番は tetriminos と同じ
export const rotations: Record<string, Record<number, string>>[] = [
  tetriminos,
  {
    I: { 14: "I", 10: "X", 6: "X", 2: "=" },
    O: { 2: "O", 1: "X", 5: "*", 6: "X" },
    L: { 1: "L", 5: "X", 9: "X", 10: "M" },
    J: { 9: "J", 5: "X", 1: "X", 2: "/" },
    T: { 9: "+", 5: "X", 1: "X", 6: "-" },
    Z: { 2: "Z", 6: "X", 5: "X", 9: "B" },
    S: { 10: "S", 6: "X", 5: "X", 1: "P" },
  },
  {
    I: { 8: "I", 9: "X", 10: "X", 11: "=" },
    O: { 6: "O", 2: "X", 1: "*", 5: "X" },
    L: { 6: "L", 5: "X", 4: "X", 8: "M" },
    J: { 4: "J", 5: "X", 6: "X", 10: "/" },
    T: { 4: "+", 5: "X", 6: "X", 9: "-" },
    Z: { 10: "Z", 9: "X", 5: "X", 4: "B" },
    S: { 8: "S", 9: "X", 5: "X", 6: "P" },
  },
  {
    I: { 1: "I", 5: "X", 9: "X", 13: "=" },
    O: { 5: "O", 6: "X", 2: "*", 1: "X" },
    L: { 9: "L", 5: "X", 1: "X", 0: "M" },
    J: { 1: "J", 5: "X", 9: "X", 8: "/" },
    T: { 1: "+", 5: "X", 9: "X", 4: "-" },
    Z: { 8: "Z", 4: "X", 5: "X", 1: "B" },
    S: { 0: "S", 4: "X", 5: "X", 9: "P" },
  },
];

export type Pose = { rot: number; x: number; y: number };
export type Cell = { x: number; y: number; ch: string };
export type Placement = {
  /** 出現の位置に置けず、終了した */
  blocked: boolean;
  /** 出現から置かれるまでの位置（変わったときだけ） */
  path: Pose[];
  /** 置かれたマス */
  cells: Cell[];
  /** 置いた直後の盤面（行を消す前） */
  placed: Grid;
  /** そろって消える行（置いた直後の盤面の y。上から順） */
  clearedRows: number[];
  /** 消える行の文字を上から順につないだもの（空白を除く。実行される命令の並び） */
  instructions: string;
  /** 行を消して詰めた後の盤面（命令の実行の前） */
  cleared: Grid;
};

export const cloneGrid = (g: Grid): Grid => g.map((col) => col.slice());

function cellsOf(mino: string, p: Pose): { dx: number; dy: number; ch: string }[] {
  // 不正なミノ（エラーのあるコード）は実行系と同じく形が無いものとして扱う
  const shape = rotations[p.rot][mino] ?? {};
  return Object.keys(shape).map((num) => {
    const n = parseInt(num);
    return { dx: n % 4, dy: Math.floor(n / 4), ch: shape[n] };
  });
}
function fits(g: Grid, mino: string, p: Pose): boolean {
  return cellsOf(mino, p).every(({ dx, dy }) => g[p.x + dx] instanceof Array && g[p.x + dx][p.y + dy] === "");
}

export function place(before: Grid, mino: string, useOrder: boolean, operation: string): Placement {
  const g = cloneGrid(before);
  let pose: Pose = { rot: 0, x: 3, y: 0 };
  const path: Pose[] = [pose];
  if (!fits(g, mino, pose)) {
    return { blocked: true, path, cells: [], placed: g, clearedRows: [], instructions: "", cleared: cloneGrid(g) };
  }
  for (const op of (operation + "^").replace(/\^/g, "VVVVVVVVVVVVVVVVVVVVVVVVVV")) {
    const next = { ...pose };
    if (op === "A") next.rot = (pose.rot + 1) % 4;
    else if (op === "B") next.rot = (pose.rot + 3) % 4;
    else if (op === "<") next.x = pose.x - 1;
    else if (op === ">") next.x = pose.x + 1;
    else if (op === "V") next.y = pose.y + 1;
    if (!fits(g, mino, next)) continue;
    pose = next;
    path.push(pose);
  }
  const cells: Cell[] = cellsOf(mino, pose).map(({ dx, dy, ch }) => {
    const c = useOrder ? (ch === "X" ? " " : ch) : " ";
    g[pose.x + dx][pose.y + dy] = c;
    return { x: pose.x + dx, y: pose.y + dy, ch: c };
  });
  const clearedRows: number[] = [];
  for (let y = 0; y < 20; y++) {
    let full = true;
    for (let x = 0; x < 10; x++) if (g[x][y] === "") full = false;
    if (full) clearedRows.push(y);
  }
  let instructions = "";
  for (const y of clearedRows) for (let x = 0; x < 10; x++) instructions += g[x][y];
  instructions = instructions.replace(/ /g, "");
  const cleared: Grid = [];
  for (let x = 0; x < 10; x++) {
    const rest = g[x].filter((_, y) => !clearedRows.includes(y));
    cleared.push([...Array(clearedRows.length).fill(""), ...rest]);
  }
  return { blocked: false, path, cells, placed: g, clearedRows, instructions, cleared };
}

/** ある位置にあるミノのマス（アニメーションで動いている途中のミノを描くため） */
export function poseCells(mino: string, pose: Pose, useOrder: boolean): Cell[] {
  return cellsOf(mino, pose).map(({ dx, dy, ch }) => ({ x: pose.x + dx, y: pose.y + dy, ch: useOrder ? (ch === "X" ? " " : ch) : " " }));
}

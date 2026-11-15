// ホームと example に出すサンプル（コードは staticcode.ts の例のまま。説明と、試すときの標準入力を足す）
import { exampleCodes } from "./staticcode";

/** example の 4 つ目（Python のスクリプト）と同じ手順で、Hello World を出力する Tetris Esolang のコードを作る */
export function helloWorldFromScript(script: string): string {
  const parts: Record<string, string> = {};
  for (const m of script.matchAll(/(\w+) = """([\s\S]*?)"""/g)) parts[m[1]] = m[2];
  const text = /for x in "([^"]*)"/.exec(script)?.[1] ?? "";
  const lines: string[] = [];
  for (const x of text) {
    for (let i = 0; i < x.charCodeAt(0); i++) lines.push(parts.add_one);
    lines.push(parts.output);
    lines.push(parts.clear);
  }
  // Python の print と同じく、各部分の後ろに改行
  return lines.map((l) => l + "\n").join("");
}

export type Sample = {
  id: string;
  title: string;
  /** ホームに出す 1 文 */
  short: string;
  description: string;
  /** example に出すコード（Python のスクリプトはそのまま見せる） */
  shown: string;
  /** 試す画面で開くコード */
  code: string;
  stdin: string;
  /** 試す画面で実行するときの速さ（長いものは最速） */
  speed?: "fast" | "max";
};

export const samples: Sample[] = [
  {
    id: "cat",
    short: "標準入力をそのまま出力し続けます。いちばん小さな例です。",
    title: "cat（入力をそのまま出す）",
    description: "標準入力を 1 文字ずつ読んで、そのまま出力します。入力が尽きた後も止まりません。空の I ミノと命令の書かれたミノで最下段をそろえて消すと「入力 → 出力」が実行され、J でラベル 100 に戻ってくり返します。",
    shown: exampleCodes[0],
    code: exampleCodes[0],
    stdin: "sample cat program input",
  },
  {
    id: "cat-commented",
    short: "cat の仕組みを 1 行ずつコメントで説明した版です。",
    title: "cat（コメントつき）",
    description: "上の cat の仕組みを、1 行ずつコメントで説明したものです。ただし、この版のコードは 10 行目の I ミノを AA（180 度回転）で置いているため、実行すると入力ではなく文字コード 1 の文字（見えない文字）が出力されます。コメントを読みながら 1 ステップずつ動きを追う例として使ってください。",
    shown: exampleCodes[1],
    code: exampleCodes[1],
    stdin: "sample cat program input",
  },
  {
    id: "cat-eof",
    short: "入力が尽きたら止まる cat です。",
    title: "EOF で止まる cat",
    description: "標準入力をそのまま出力し、入力が尽きたら（EOF で R = -1 になったら）終わります。È（Unicode の 200）だけは扱えません（コードの 1 行目のコメントのとおり）。",
    shown: exampleCodes[2],
    code: exampleCodes[2],
    stdin: "Hello, Tetris!",
  },
  {
    id: "hello",
    short: "「Hello, World!」を出力します（約 1 万 3 千行。最速で実行）。",
    title: "Hello, World!（Python で生成）",
    description: "「Hello, World!」を出力する Tetris Esolang のコードを生成する Python のスクリプトです。文字コードの数だけ 1 を足す行の組を並べます。「開く」と「実行」では、このスクリプトと同じ手順で生成したコード（約 1 万 3 千行）を開きます。",
    shown: exampleCodes[3],
    code: helloWorldFromScript(exampleCodes[3]),
    stdin: "",
    speed: "max",
  },
];

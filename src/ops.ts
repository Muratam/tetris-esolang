// 命令と操作の意味（仕様の表と、デバッグの表のチップの説明に使う。中身は readme.md の仕様と同じ）
export const instructions: { ch: string; name: string; text: string }[] = [
  { ch: "X", name: "Nop", text: "何もしない（文字の書かれていないマス）" },
  { ch: "I", name: "Input", text: "標準入力から 1 文字読み、R をその Unicode の値にする。EOF なら R = -1" },
  { ch: "O", name: "Output", text: "R の値を Unicode の文字として標準出力に出す" },
  { ch: "J", name: "Jump", text: "ラベル R にジャンプする（ラベルが無ければジャンプしない）" },
  { ch: "Z", name: "Zero", text: "P = 0" },
  { ch: "P", name: "Pointer", text: "P += R（ポインタを動かす）" },
  { ch: "L", name: "Load", text: "R = A[P]" },
  { ch: "S", name: "Store", text: "A[P] = R" },
  { ch: "+", name: "Add", text: "R = R + A[P]" },
  { ch: "-", name: "Sub", text: "R = R - A[P]" },
  { ch: "*", name: "Mul", text: "R = R * A[P]" },
  { ch: "/", name: "Div", text: "R = R / A[P]（切り捨て。0 で割ると終了）" },
  { ch: "=", name: "Compare", text: "宇宙船演算: R が A[P] と等しければ 0、小さければ -1、大きければ 1" },
  { ch: "M", name: "Minus", text: "R = -R" },
  { ch: "B", name: "Bomb", text: "フィールドをすべて消し、この後の命令は実行しない" },
];
export const instructionText: Record<string, string> = Object.fromEntries(instructions.map((i) => [i.ch, `${i.ch}: ${i.text}`]));

export const moves: { ch: string; text: string }[] = [
  { ch: "<", text: "左へ 1 マス" },
  { ch: ">", text: "右へ 1 マス" },
  { ch: "V", text: "下へ 1 マス" },
  { ch: "^", text: "ハードドロップ（下まで落とす）" },
  { ch: "A", text: "時計回りに回転" },
  { ch: "B", text: "反時計回りに回転" },
];

/** ミノと、":" のときに書かれている命令（Iの書き方の上から順などは仕様のとおり） */
export const minoOrders: { mino: string; order: string; note: string }[] = [
  { mino: "I", order: "IXX=", note: "上から順に" },
  { mino: "L", order: "LXXM", note: "上から順に" },
  { mino: "J", order: "JXX/", note: "上から順に" },
  { mino: "Z", order: "ZXXB", note: "左上から順に" },
  { mino: "S", order: "SXXP", note: "右上から順に" },
  { mino: "O", order: "OX*X", note: "右上から順に" },
  { mino: "T", order: "+XX-", note: "左上から順に" },
];

// コードの行番号と、実行系がラベルごとに持つ「置く行の並び」の対応（実行系の parse と同じ規則で数える）。
// 実行系の code[label][counter] が、ソースの何行目かを引くために使う。

/** ラベル（ラベルの無い先頭は Infinity）→ その並びの各要素のソースの行番号（1 始まり） */
export type LineMap = Record<string, number[]>;

export function lineMap(source: string): LineMap {
  const result: LineMap = {};
  const numbers: number[] = [Infinity];
  let lineNumber = 0;
  for (let code of source.split(/\n/g)) {
    lineNumber++;
    if (code.match(/^#/)) continue;
    code = code.replace(/#.*/g, "");
    code = code.replace(/\s/g, "");
    if (!code) continue;
    const last = String(numbers[numbers.length - 1]);
    if (!result[last]) result[last] = [];
    if (code.match(/^-?\d+:/)) {
      const parsed = parseInt(code);
      numbers.push(parsed);
      continue;
    }
    for (const num of numbers) (result[String(num)] ??= []).push(lineNumber);
  }
  return result;
}

/** ラベルと counter から、ソースの行番号（無ければ null） */
export function sourceLine(map: LineMap, label: number, counter: number): number | null {
  const list = map[String(label)];
  return list && list[counter] !== undefined ? list[counter] : null;
}

/** エラーのメッセージ（"Error 3行目:..."）に出る行番号 */
export function errorLines(errorMessage: string): number[] {
  return [...errorMessage.matchAll(/Error (\d+)行目/g)].map((m) => Number(m[1]));
}

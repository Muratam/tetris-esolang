export type OperationLine = { blockType: string, operation: string, useOrder: boolean };
export type CodeBlock = { [key: number]: Array<OperationLine> };
export class TetrisInterpreter {
  state: Array<string>;
  finished: boolean;
  private code: CodeBlock;
  private counter: number;
  private label: number;
  constructor(code: string) {
    this.state = new Array(10);
    this.code = this.parse(code);
    this.counter = 0;
    this.label = Infinity;
    this.finished = false;
    for (let x = 0; x < 20; x++)this.state[x] = new Array(20).map(_ => " ").join("");
  }
  parse(codestr: string): CodeBlock {
    let result: CodeBlock = {};
    let numbers = [Infinity];
    for (let code of codestr.split(/\n/g)) {
      if (code.match(/^#/)) continue;
      code = code.replace(/#.*/g, "");
      code = code.replace(/\s/g, "");
      if (!code) continue;
      let lastNumber = numbers[numbers.length - 1];
      if (!result[lastNumber]) result[lastNumber] = [];
      if (code.match(/^\d+:/)) {
        let parsed = parseInt(code);
        if (parsed === NaN) throw Error;
        if (result[parsed]) throw Error;
        numbers.push(parsed);
        continue;
      }
      if (code.length < 2) throw Error;
      if ("ILJZSOT".split("").every(x => x !== code[0])) throw Error;
      if (code[1] !== ":" || code[1] !== ".") throw Error;
      for (let i = 2; i < code.length; i++) {
        if ("><^VAB".split("").every(x => x !== code[i])) throw Error;
      }
      let codeBlock: OperationLine = {
        blockType: code[0],
        useOrder: code[1] === ":",
        operation: code.substring(2)
      }
      for (let num of numbers) result[num].push(codeBlock);
    }
    return result;
  }

  execute(callback: ((outputChar: string | null) => any)) {
    // let now = this.state[]
  }
}

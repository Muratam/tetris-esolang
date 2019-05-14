export class TetrisInterpreter {
  state: Array<string>;
  finished: boolean;
  private code: Array<string>;
  private counter: number;
  constructor(code: string) {
    this.state = new Array(10);
    this.code = code.split(/\n/g);
    this.counter = 0;
    this.finished = false;
    for (let x = 0; x < 20; x++)this.state[x] = new Array(20).map(_ => " ").join("");
  }

  execute(callback: ((outputChar: string | null) => any)) {

  }
}

import { Terminal, ITerminalOptions } from "xterm";
import "xterm/dist/xterm.css";
class TetrisTerminal extends Terminal {
  private buffer: Array<Array<string>>
  private width: number;
  private height: number;
  constructor(options: ITerminalOptions) {
    super(options);
    this.buffer = new Array(this.rows);
    this.width = this.cols;
    this.height = this.rows;
    this.initBuffer();
  }
  private initBuffer() {
    for (let x = 0; x < this.width; x++) {
      this.buffer[x] = new Array(this.height);
      for (let y = 0; y < this.rows; y++) {
        this.buffer[x][y] = " ";
      }
    }
    this.flush();
  }
  flush() {
    let code = "\033c";
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.width; x++) {
        code += this.buffer[x][y];
      }
      code += "\n";
    }
    this.write(code);
  }
}

function initTerminal(): TetrisTerminal {
  let term = new TetrisTerminal({
    allowTransparency: true,
    bellStyle: "sound",
    cols: 64,
    rows: 100,
  });
  let termDOM = document.createElement("div");
  document.body.appendChild(termDOM);
  term.open(termDOM);
  return term;
}

let term = initTerminal();
term.on("key", key => {
  term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ https://iikanji.com/');
  term.write(key);
});

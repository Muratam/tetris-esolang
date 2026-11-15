// 命令を網羅するために、行が消えやすいプログラムを探す（make-golden.mjs の dense-* の元）。
//   node test/tools/search-dense.mjs <作業場所>/old  → <作業場所>/old/found.json
import { createRequire } from "node:module";
const oldDir = process.argv[2];
const require = createRequire(oldDir + "/");
const { TetrisInterpreter } = require(oldDir + "/tetriscore.js");
console.assert = () => {};
let seed = 777;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (s) => s[Math.floor(rnd() * s.length)];
const randInt = (a, b) => a + Math.floor(rnd() * (b - a + 1));
// 1 行ずつ、候補を何個か試して盤面の高さが低くなるものを選ぶ（行が消えやすい）
function height(t){let h=0;for(let x=0;x<10;x++)for(let y=0;y<20;y++)if(t.state[x][y]!==""){h=Math.max(h,20-y);break;}return h;}
function holes(t){let n=0;for(let x=0;x<10;x++){let seen=false;for(let y=0;y<20;y++){if(t.state[x][y]!=="")seen=true;else if(seen)n++;}}return n;}
function greedy(lines, stdin){
  const prog=[];
  for(let i=0;i<lines;i++){
    let best=null;
    for(let k=0;k<12;k++){
      const rot=randInt(0,3);let ops=rot===3?"B":"A".repeat(rot);ops+=(rnd()<0.5?"<":">").repeat(randInt(0,5));
      const line=`${pick("ILJZSOT")}${rnd()<0.6?":":"."}${ops}`;
      const t=new TetrisInterpreter([...prog,line].join("\n"),stdin);
      for(let s=0;s<prog.length+1;s++)t.execute1Step();
      const score=height(t)*3+holes(t)+(t.finished?1000:0);
      if(!best||score<best.score)best={line,score};
    }
    prog.push(best.line);
  }
  return prog.join("\n");
}
const want={};
for(let n=0;n<300 && Object.keys(want).length<12;n++){
  const stdin="xyz";
  const code=greedy(40,stdin);
  const t=new TetrisInterpreter(code,stdin);let out="";const ops=new Set();
  for(let s=0;s<40;s++){out+=t.execute1Step();const m=/^execute \[(.*)\]/.exec(t.stateMessage);if(m)for(const ch of m[1])ops.add(ch);}
  for(const op of ops) if(!want[op]) want[op]=code;
  if(out&&!want.out) want.out=code;
}
console.log(Object.keys(want).sort().join(" "));
require("node:fs").writeFileSync(oldDir + "/found.json",JSON.stringify(want));

export const tetrisBNF = `<program>    ::= <statements>
<statements> ::= <statement> "\\n" | <statements>
<statement>  ::= <tet-move> | <comment> | <label>
<tet-move>   ::= <tetris> <use-order><move>
<comment>    ::= /^#.*/
<label>      ::= /-?[0-9]+:/
<tetris>     ::= /[ILJZSOT]/
<move>       ::= /[><^VAB]*/
<use-order>  ::= "." | ":"`;
export const exampleCode = `# EOFで止まらないcatプログラム例
100:
I.A>>>>>>>>>>>>
I.A>>>>>>>>>>>>
O:A>>>>>>>>>>>><<<<
I:A<<<<<<<<<<<<<<
J:B<<<<<<<<<<<
Z:A<<<<<<<<<<<>>>>`;
export const exampleCodeWithComment = `100:
# 何も命令を実行しない空のIミノを右端に回転させて二段配置
I.A>>>>>>>>>>>>
I.A>>>>>>>>>>>>
# 「OX*X」と書かれているOミノを中央に配置
O:A>>>>>>>>>>>><<<<
#  「IXX=」と書かれているIミノを横向きに配置して実行。
# 最下層「IXX=OXXXXX」が実行されて、標準入力１文字をそのまま標準出力する。その後最下層は「____X*XXXX」になる。
I:A<<<<<<<<<<<<<<
# 「JXX/」と書かれているJミノを横向きに配置して左端に配置。最下層は「JXX_X*XXXX」になる。
J:B<<<<<<<<<<<
# 「ZXXB」と書かれているZミノを隙間に配置して実行させる。実行する最下層は「JXXBX*XXXX」。一段消えるのでRに100点が入り、J命令でラベルR=100にジャンプ。B命令でミノはすべて消えるため問題なくループできる。
Z:A<<<<<<<<<<<>>>>`;

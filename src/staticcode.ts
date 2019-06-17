export const tetrisBNF = `<program>    ::= <statements>
<statements> ::= <statement> "\\n" | <statements>
<statement>  ::= <tet-move> | <comment> | <label>
<tet-move>   ::= <tetris> <use-order><move>
<comment>    ::= /^#.*/
<label>      ::= /-?[0-9]+:/
<tetris>     ::= /[ILJZSOT]/
<move>       ::= /[><^VAB]*/
<use-order>  ::= "." | ":"`;
export const exampleCodes = [
  `# EOFで止まらないcatプログラム例
100:
I.>>>
I.>>>
O:B
I:<<<
J:<<<
Z:A<`,
  `# EOF で止まらない cat プログラムの例(コメントつき)
100:
# 何も命令を実行しない空のIミノを右端に回転させて二段配置
I.>>>
I.>>>
# 「OX*X」と書かれているOミノを中央に配置
O:B
#  「IXX=」と書かれているIミノを横向きに配置して実行。
# 最下層「=XXIOXXXXX」が実行されて、標準入力１文字をそのまま標準出力する。その後最下層は「____X*XXXX」になる。
I:AA<<<
# 「JXX/」と書かれているJミノを横向きに配置して左端に配置。最下層は「XXJ_X*XXXX」になる。
J:<<<
# 「ZXXB」と書かれているZミノを隙間に配置して実行させる。実行する最下層は「JXXBX*XXXX」。一段消えるのでRに100点が入り、J命令でラベルR=100にジャンプ。B命令でミノはすべて消えるため問題なくループできる。
Z:A<`, `
# EOF で終了する(È(unicode:200)以外対応の) cat プログラム例
200:
O:>>>>B
I.A>>
J:>
I:<<<
I.A>>>>
I.A>>>
I.A>>
I.A>
I.A
Z:A<
J:A<<
O.<<<<
-1:
O.
`, `#! /usr/bin/python3
# 「Hello World!!」 を出力するtetrisを出力するコード
add_one = """T.<<
J.B>>>>
S:>>
T:AA
Z:A<<<<
S:A<<<
J:B
L.A>
S:B>>>
I.A<<<<<
I.A>>>>>"""
output = """T.B<<
L.A>>>
Z:A<<<<
L:A<
J.B>>
O:
S:A<<<
J:B
L.A>
S:B>>>
I.A>>>>
I.B<<<<<
I.A>>>"""
clear = """T:B
I.A
S:B>>>
T.B>>>>
L:B<<<
J.A<<
J:B
S:AA<<
Z:B<<<<
S:B>>
L:B>>>
I.A>>>>>
Z:A<<<<
O.<<
O.>>>>>"""

for x in "Hello, World!":
    for i in range(ord(x)):
        print(add_one)
    print(output)
    print(clear)


"""
[[72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
72.times:
  # Z S / P + S B
  R := 100
  P := 0
  P[0] := R
  R := R / P[0]
  P += 1
  R := R + P[0]
  P[0] := R
output:
  # Z S / P L O B
  R := 100
  P := 0
  P[0] := R
  R := R / P[0]
  P += 1
  R := P[0]
  print R
clear:
  # Z S / P L M + S B
  R := 100
  P := 0
  P[0] := R
  R := R / P[0]
  P += 1
  R := P[0]
  R := -R
  R := R + P[0]
  P[0] := R
"""
`]

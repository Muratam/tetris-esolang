#! /usr/bin/python3
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

for x in [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 33]:
    for i in range(x):
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

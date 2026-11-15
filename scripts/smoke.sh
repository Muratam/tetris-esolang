#!/bin/sh
# 配信の確認: health が 200 で {"ok":true}、index.html と、それが読む JS・CSS が 200 で出ること。
#   使い方: scripts/smoke.sh [ベースの URL]（既定 http://127.0.0.1:3160。ラボは http://10.44.135.10:3160、公開は https://sagisawa.0am.jp）
set -eu
base=${1:-http://127.0.0.1:3160}
fail=0
check() { # <パス> <期待する中身の一部>
  body=$(curl -fsS --max-time 10 "$base$1") || { echo "NG $1（200 でない）"; fail=1; return; }
  case $body in *"$2"*) echo "OK $1" ;; *) echo "NG $1（「$2」が無い）"; fail=1 ;; esac
}
check /tetris/api/health '{"ok":true}'
check /tetris/ '<title>Tetris Esolang</title>'
# index.html が読む /tetris/assets/ の JS と CSS
assets=$(curl -fsS --max-time 10 "$base/tetris/" | grep -o '/tetris/assets/[A-Za-z0-9._-]*' | sort -u || true)
[ -n "$assets" ] || { echo "NG index.html に /tetris/assets/ が無い"; fail=1; }
for a in $assets; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$base$a")
  [ "$code" = 200 ] && echo "OK $a" || { echo "NG $a（$code）"; fail=1; }
done
# スラッシュなしは相対の Location で /tetris/ へ
loc=$(curl -sS -o /dev/null -w '%{redirect_url}' --max-time 10 "$base/tetris")
case $loc in */tetris/) echo "OK /tetris → /tetris/" ;; *) echo "NG /tetris の転送先: $loc"; fail=1 ;; esac
# リンクのカード（OGP・Twitter Card）: index.html の head に全部のメタがあり（URL は公開の入口の絶対 URL）、画像が 1200×630 の PNG で取れること
public=https://sagisawa.0am.jp
head=$(curl -fsS --max-time 10 "$base/tetris/" | sed '/<\/head>/q')
for m in '<meta name="description" content=' \
  'property="og:site_name" content="sagisawa"' 'property="og:type" content="website"' 'property="og:locale" content="ja_JP"' \
  'property="og:title" content="Tetris Esolang"' 'property="og:description" content=' "property=\"og:url\" content=\"$public/tetris/\"" \
  "property=\"og:image\" content=\"$public/tetris/og.png\"" 'property="og:image:type" content="image/png"' \
  'property="og:image:width" content="1200"' 'property="og:image:height" content="630"' 'property="og:image:alt" content=' \
  'name="twitter:card" content="summary_large_image"' 'name="twitter:title" content=' 'name="twitter:description" content=' \
  "name=\"twitter:image\" content=\"$public/tetris/og.png\""; do
  case $head in *"$m"*) ;; *) echo "NG head に $m が無い"; fail=1 ;; esac
done
[ $fail = 0 ] && echo "OK /tetris/ の OGP・Twitter Card のメタ"
ct=$(curl -sS -o /dev/null -w '%{http_code} %{content_type}' --max-time 10 "$base/tetris/og.png")
size=$(curl -fs --max-time 10 "$base/tetris/og.png" 2>/dev/null | head -c 24 | od -An -tu1 -j16 -N8 | awk '{print $1*16777216+$2*65536+$3*256+$4 "x" $5*16777216+$6*65536+$7*256+$8}')
if [ "$ct" = "200 image/png" ] && [ "$size" = 1200x630 ]; then echo "OK /tetris/og.png（$ct、$size）"; else echo "NG /tetris/og.png（$ct、$size）"; fail=1; fi
exit $fail

#!/bin/sh
# 配信の確認: health が 200 で {"ok":true}、index.html と build.js が 200 で出ること。
#   使い方: scripts/smoke.sh [ベースの URL]（既定 http://127.0.0.1:3160。ラボは http://10.44.135.10:3160、公開は https://sagisawa.0am.jp）
set -eu
base=${1:-http://127.0.0.1:3160}
fail=0
check() { # <パス> <期待する中身の一部>
  body=$(curl -fsS --max-time 10 "$base$1") || { echo "NG $1（200 でない）"; fail=1; return; }
  case $body in *"$2"*) echo "OK $1" ;; *) echo "NG $1（「$2」が無い）"; fail=1 ;; esac
}
check /tetris-esolang/api/health '{"ok":true}'
check /tetris-esolang/ '<title>Tetris Esolang</title>'
check /tetris-esolang/build.js 'use-order'
# スラッシュなしは相対の Location で /tetris-esolang/ へ
loc=$(curl -sS -o /dev/null -w '%{redirect_url}' --max-time 10 "$base/tetris-esolang")
case $loc in */tetris-esolang/) echo "OK /tetris-esolang → /tetris-esolang/" ;; *) echo "NG /tetris-esolang の転送先: $loc"; fail=1 ;; esac
exit $fail

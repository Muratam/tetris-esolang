# tetris-esolang で作業するときの決まり

テトリスの難解プログラミング言語（Tetris Esolang）の紹介と実行のサイト（`/tetris/`）のリポジトリ。ここにはこのアプリに特有の決まりだけを書く。

**先に読む**: 共通の決まり（禁止事項・作業の流れ・守ること）は `Muratam/sagisawa` の `CLAUDE.md`。サーバーの管理者AI は `/home/claude/sagisawa/CLAUDE.md` を、ほかの環境では GitHub か手元の clone を読む。
構成・デプロイ・テストのコマンドは `HANDOFF.md`。

## このアプリに特有のこと
- 既定のブランチは **master**（main ではない）。PR の `--base` も master。
- public のリポジトリ。push は ssh の Host `github-tetris`（このリポジトリ専用のデプロイキー）。ラボは https の公開 URL で pull する。
- 言語の仕様（`readme.md`・`src/staticcode.ts` の BNF と説明）と処理（`src/tetriscore.ts`）は変えない。変えるときは先に murata に聞く。
- リポジトリ名は `tetris-esolang`、URL のパスは `/tetris/`。
- 実行系を変えると `npm test` が移す前の版の記録（`test/golden.json`）と照合して落ちる。仕様どおりに変えるときだけ、murata に聞いてから golden を再生成する。
- 画面の色・面・線・文字は `src/style.css` のトークン（sagisawa のポータルと同じ）だけを使う。外部の CDN は使わない。

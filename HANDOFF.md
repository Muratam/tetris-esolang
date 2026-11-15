# 引き継ぎメモ（tetris-esolang）

構成（事実）・デプロイ・残作業。作業の決まりは `CLAUDE.md`。サーバーの事実は `Muratam/sagisawa-admin` の `inventory.md`。事実は古くなるので、使う前に実物で確認する。

## 1. 全体像

| 項目 | 場所 |
|---|---|
| 公開 | https://sagisawa.0am.jp/tetris/ （public: ログインなし。予定） |
| リポジトリ | GitHub `Muratam/tetris-esolang`（public、既定のブランチ master）。管理者AI のワーキングコピーは `/home/claude/tetris-esolang` |
| push | 管理者AI はこのリポジトリ専用のデプロイキー（書き込み、ssh の Host `github-tetris`。murata の登録待ち）。ラボの `apps` は https の公開 URL で pull だけ（public なので読み取りのキーは要らない） |
| 動く場所 | ラボの `apps` の `/srv/tetris-esolang/`、compose のプロジェクト `tetris-esolang`、`10.44.135.10:3160` |

リポジトリ名は `tetris-esolang`、URL のパスは `/tetris/`（`vite.config.ts` の `base`・`docker/nginx.conf`・`scripts/smoke.sh` で合わせる）。

## 2. アプリ
- **技術構成**: Vue 3（Composition API・`<script setup lang="ts">`）+ Vite + TypeScript の静的サイト（Muratam/akochandaaaaaa と同じ形）。言語の実行系は `src/tetriscore.ts`、BNF と例は `src/staticcode.ts`、画面は `src/App.vue`（上の帯とタブ）・`src/components/TryView.vue`（盤面の canvas と実行）・`SpecView.vue`（仕様）・`AppIcon.vue`（インラインの SVG のアイコン）。配信は nginx のコンテナ（`Dockerfile`・`docker/nginx.conf`。uid 10001、読み取り専用、JS・CSS・HTML はビルド時に gzip、`/tetris/assets/` は immutable）。サーバー側の処理・DB・シークレット・外部の CDN は無い。
- **画面**: sagisawa のポータル（`Muratam/sagisawa` の `portal/shared/styles/tokens.css`）と同じトークンのダークテーマ（`src/style.css`。色・面・線・文字はここの変数だけ。canvas の色も描くときにここの変数を読む）。タブ（Try・Specification・example）、ホームは題名と仕様。Try の画面は幅 860px 以上で盤面と入力の 2 列、それ未満は 1 列。書いたコードと実行の状態はタブを移っても残る（元の版と同じ）。スマホ縦（390×844）・PC（1280×720）・ポータルの iframe（左に 208px のナビ、上に 36px の帯）の中で横にはみ出さないこと。
- **T380 の再構成**: 元は Vue 2 + webpack 2 + pug + Bulma + Font Awesome の CDN（node-sass が Node 26 でビルドできなかった）。実行系（`tetriscore.ts`・`staticcode.ts`）は中身を変えずに移した（TS 6 が常に true と指摘する 1 行に `@ts-expect-error` を付けただけ。lint は実行系のファイルだけ `prefer-const` などを外す）。画面の動き（いつ実行系を新しく作るか・1000 ステップ・タブを移ったら盤面を消す）も元のまま。TypeScript は 6.0（7.0 は typescript-eslint が未対応）。
- **テスト**:
  - `npm run lint`（ESLint 10 + typescript-eslint + eslint-plugin-vue）
  - `npm test`（vitest、約 2 秒）: `test/golden.json` は移す前の版（71c27e5 の `tetriscore.ts` を typescript 2.9 で es5 に変換）で 67 個のプログラム（例 3 つ × 標準入力 4 通り、Hello World〔`utils/hello.py` の出力、13000 ステップ〕、エラー・境界、乱数のプログラム 40、行が消えやすいプログラム）を動かした記録。1 ステップごとの出力・stateMessage・finished・盤面の sha256 と、最初の数ステップ・最後の状態が一致することを確認する。再生成するときは `test/tools/make-golden.mjs` の先頭の手順
  - `npm run build`（`vue-tsc --noEmit` の型の確認と `vite build`。`dist/`）
  - 配信: `scripts/smoke.sh [ベースの URL]`（health が `{"ok":true}`、`/tetris/` と、それが読む `/tetris/assets/` の JS・CSS が 200、`/tetris` が `/tetris/` へ転送）。ラボでは `scripts/smoke.sh http://10.44.135.10:3160`、公開後は `scripts/smoke.sh https://sagisawa.0am.jp`
  - 画面: ブラウザで Try → Try Sample → Execute 1000 Steps を押し、stdout が `sample cat program input` になること
- **デプロイ**: master にマージしてから（PR）、ラボで `scripts/deploy-lab.sh`。`/tetris/api/health` が 200 を返すことを確認する。
  - murata: `sudo incus exec --project user-1001 apps -- /srv/tetris-esolang/scripts/deploy-lab.sh`
  - 管理者AI: `incus exec apps -- /srv/tetris-esolang/scripts/deploy-lab.sh`
- **公開**: `sagisawa-expose add tetris 10.44.135.10:3160 --kind public`

## 3. 残作業（初回の配置。T380 の後）
1. push 用のデプロイキーを登録し（murata）、`/home/claude/tetris-esolang` の origin を `git@github-tetris:Muratam/tetris-esolang.git` にする
2. この変更を master にマージする（PR）
3. ラボで clone: `incus exec apps -- git clone https://github.com/Muratam/tetris-esolang.git /srv/tetris-esolang`
4. 初回のデプロイ: `incus exec apps -- /srv/tetris-esolang/scripts/deploy-lab.sh` → `incus exec apps -- /srv/tetris-esolang/scripts/smoke.sh http://10.44.135.10:3160`（Docker のイメージのビルドはここで初めて確認する）
5. 公開: `sudo -n /usr/local/sbin/sagisawa-expose add tetris 10.44.135.10:3160 --kind public` → `scripts/smoke.sh https://sagisawa.0am.jp`
6. `Muratam/sagisawa-admin` の `inventory.md` に追記する。ポータル・ホームのアプリの一覧（`Muratam/sagisawa` の `portal/home/src/apps.ts`）に載せるかは murata に聞く

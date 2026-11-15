# 引き継ぎメモ（tetris-esolang）

構成（事実）・デプロイ・残作業。作業の決まりは `CLAUDE.md`。サーバーの事実は `Muratam/sagisawa-admin` の `inventory.md`。事実は古くなるので、使う前に実物で確認する。

## 1. 全体像

| 項目 | 場所 |
|---|---|
| 公開 | https://sagisawa.0am.jp/tetris-esolang/ （public: ログインなし。予定） |
| リポジトリ | GitHub `Muratam/tetris-esolang`（public、既定のブランチ master）。管理者AI のワーキングコピーは `/home/claude/tetris-esolang` |
| push | 管理者AI はこのリポジトリ専用のデプロイキー（書き込み、ssh の Host `github-tetris`。murata の登録待ち）。ラボの `apps` は https の公開 URL で pull だけ（public なので読み取りのキーは要らない） |
| 動く場所 | ラボの `apps` の `/srv/tetris-esolang/`、compose のプロジェクト `tetris-esolang`、`10.44.135.10:3160` |

## 2. アプリ
- **技術構成**: Vue 2 + TypeScript + webpack 3（`webpack.config.js`。`publicPath: './'` の相対なので `/tetris-esolang/` の下でもそのまま動く）の静的サイト。テンプレートは pug、スタイルは scss（dart-sass の `sass`）と Bulma。アイコンは Font Awesome の CDN（`src/index.html`）。言語の処理は `src/tetriscore.ts`、画面は `src/components/Tetris.vue`。配信は nginx のコンテナ（`Dockerfile`・`docker/nginx.conf`。uid 10001、読み取り専用、JS・HTML はビルド時に gzip）。サーバー側の処理・DB・シークレットは無い。
- **依存の更新（T380）**: `node-sass`（Node 26 でビルドできない）を `sass` に、`sass-loader` を 7.3.1（`sass` を自動で使う）に、`webpack` を 2 から 3 に（`sass-loader` 7.3 の要件）した。ほかの依存の版は lockfile のまま。出力の HTML は同じ、画面のスクリーンショット（ホーム・Try でサンプルを 1000 ステップ実行）は前の版と画素まで同じ。
- **テスト**（自動のテストは無い）:
  - ビルド: `npm ci && npm run build`（`dist/` に `index.html`・`build.js`・`build.js.map`）
  - 配信: `scripts/smoke.sh [ベースの URL]`（health が `{"ok":true}`、`/tetris-esolang/` と `build.js` が 200、`/tetris-esolang` が `/tetris-esolang/` へ転送）。ラボでは `scripts/smoke.sh http://10.44.135.10:3160`、公開後は `scripts/smoke.sh https://sagisawa.0am.jp`
  - 画面: ブラウザで Try → Try Sample → Execute 1000 Steps を押し、標準出力が `sample cat program input` になること
- **デプロイ**: master にマージしてから（PR）、ラボで `scripts/deploy-lab.sh`。`/tetris-esolang/api/health` が 200 を返すことを確認する。
  - murata: `sudo incus exec --project user-1001 apps -- /srv/tetris-esolang/scripts/deploy-lab.sh`
  - 管理者AI: `incus exec apps -- /srv/tetris-esolang/scripts/deploy-lab.sh`
- **公開**: `sagisawa-expose add tetris-esolang 10.44.135.10:3160 --kind public`

## 3. 残作業（初回の配置。T380 の後）
1. push 用のデプロイキーを登録し（murata）、`/home/claude/tetris-esolang` の origin を `git@github-tetris:Muratam/tetris-esolang.git` にする
2. この変更を master にマージする（PR）
3. ラボで clone: `incus exec apps -- git clone https://github.com/Muratam/tetris-esolang.git /srv/tetris-esolang`
4. 初回のデプロイ: `incus exec apps -- /srv/tetris-esolang/scripts/deploy-lab.sh` → `incus exec apps -- /srv/tetris-esolang/scripts/smoke.sh http://10.44.135.10:3160`
5. 公開: `sudo -n /usr/local/sbin/sagisawa-expose add tetris-esolang 10.44.135.10:3160 --kind public` → `scripts/smoke.sh https://sagisawa.0am.jp`
6. `Muratam/sagisawa-admin` の `inventory.md` に追記する

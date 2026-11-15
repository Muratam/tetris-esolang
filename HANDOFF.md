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
- **技術構成**: Vue 3（Composition API・`<script setup lang="ts">`）+ Vite + TypeScript の静的サイト（Muratam/akochandaaaaaa と同じ形）。言語の実行系は `src/tetriscore.ts`（変えない）、BNF と例は `src/staticcode.ts`。表示のためのロジック: `src/runner.ts`（「試す」の画面の実行の管理。実行系をそのまま呼び、1 ステップごとの詳細を集める。戻るときは最初からもう一度実行する）・`src/placement.ts`（ミノの動き・設置・行の消去の表示用のコピー）・`src/lines.ts`（行番号の対応）・`src/inspect.ts`（実行系の中の値を読むだけ）・`src/samples.ts`（サンプルの説明。Hello World は例の 4 つ目の Python と同じ手順で生成）・`src/ops.ts`（命令と操作の説明）・`src/store.ts`（ページと「試す」の画面のコード）。画面は `src/App.vue`（帯とタブ）と `src/components/`（HomeView・TryView〔BoardCanvas・CodeEditor・DebugTable〕・SpecView・ExamplesView・MinoShape・AppIcon）。favicon は sagisawa のポータルと同じ `public/icon.svg`・`apple-icon.png`（`Muratam/sagisawa` の `portal/app/src/app/` のコピー）。配信は nginx のコンテナ（`Dockerfile`・`docker/nginx.conf`。uid 10001、読み取り専用、JS・CSS・HTML はビルド時に gzip、`/tetris/assets/` は immutable）。サーバー側の処理・DB・シークレット・外部の CDN は無い。
- **画面**: sagisawa のポータル（`Muratam/sagisawa` の `portal/shared/styles/tokens.css`）と同じトークンのダークテーマ（`src/style.css`。色・面・線・文字はここの変数だけ。canvas の色も描くときにここの変数を読む）。画面の文言は日本語（タブは「試す」「仕様」「例」。T405。言語の名前 Tetris Esolang・命令とミノの名前・サンプルのコードと標準入力は元のまま）。上の帯: 印と名前・タブ（左揃え。選んだタブは下線）・右端に GitHub。タブは太字の幅を先に取り、html に scrollbar-gutter: stable を付けて、切り替えても帯と本文が左右にずれない（T404）。ホームは「これは何か」・仕組み 3 段・サンプルの「実行する」。仕様は処理の流れ・書き方・操作・ミノの図・命令の表・例。例は各例の説明と「開く」「実行」。試す（T385）: 元の枠（サンプルを読み込む・1 ステップ実行・1000 ステップ実行・コード・標準入力・標準出力・デバッグ。元の版の英語の Try Sample・Execute 1 Step などにあたる）に、1 ステップごとのアニメーション（出現 → 落ちる → 置く → そろった行が光る → 詰まる。後は変わったマスを枠で示す。prefers-reduced-motion と速さ「最速」では動かさない）、行番号つきのコード（いま置いた行・直前の行・次の行・エラーの行に印）、デバッグの表（状態・置いた行・消えた行と実行した命令・出力・次の行・P・A・標準入力。実行系のメッセージもそのまま下に残す）、最初へ・1 ステップ戻る・速さを選べる連続実行（一時停止つき）を足した。幅 900px 以上で盤面と操作が左、コード・入出力・デバッグが右。書いたコードと実行の状態はタブを移っても残る。スマホ縦（390×844）・PC（1280×720）・ポータルの iframe（左に 208px のナビ、上に 36px の帯）の中で横にはみ出さないこと。
- **T380 の再構成**: 元は Vue 2 + webpack 2 + pug + Bulma + Font Awesome の CDN（node-sass が Node 26 でビルドできなかった）。実行系（`tetriscore.ts`・`staticcode.ts`）は中身を変えずに移した（TS 6 が常に true と指摘する 1 行に `@ts-expect-error` を付けただけ。lint は実行系のファイルだけ `prefer-const` などを外す）。画面の動き（いつ実行系を新しく作るか・1000 ステップ・タブを移ったら盤面を消す）も元のまま。TypeScript は 6.0（7.0 は typescript-eslint が未対応）。
- **テスト**:
  - `npm run lint`（ESLint 10 + typescript-eslint + eslint-plugin-vue）
  - `npm test`（vitest、約 5 秒）: `test/golden.json` は移す前の版（71c27e5 の `tetriscore.ts` を typescript 2.9 で es5 に変換）で 67 個のプログラム（例 3 つ × 標準入力 4 通り、Hello World〔`utils/hello.py` の出力、13000 ステップ〕、エラー・境界、乱数のプログラム 40、行が消えやすいプログラム）を動かした記録。1 ステップごとの出力・stateMessage・finished・盤面の sha256 と、最初の数ステップ・最後の状態が一致することを確認する。再生成するときは `test/tools/make-golden.mjs` の先頭の手順
  - `test/viewer.test.ts`: 表示用のロジックが実行系と食い違わないこと（行の対応が実行系の parse と同じ、置き方のコピーで消した後の盤面が golden の全プログラムの全ステップで実行系と一致、Runner の出力・debug が実行系と同じ、戻ると同じ状態、サンプルの説明のとおりに動く〔Hello World の生成で「Hello, World!」〕）
  - `npm run build`（`vue-tsc --noEmit` の型の確認と `vite build`。`dist/`）
  - 配信: `scripts/smoke.sh [ベースの URL]`（health が `{"ok":true}`、`/tetris/` と、それが読む `/tetris/assets/` の JS・CSS が 200、`/tetris` が `/tetris/` へ転送）。ラボでは `scripts/smoke.sh http://10.44.135.10:3160`、公開後は `scripts/smoke.sh https://sagisawa.0am.jp`
  - 画面: ブラウザで「試す」→「サンプルを読み込む」→「1000 ステップ実行」を押し、標準出力が `sample cat program input` になること
- **リンクのカード（T410）**: Slack・X などでリンクを貼るとカードが出るように、`index.html` の head の先頭（charset・viewport のすぐ後）に OGP と Twitter Card を置く（og:site_name `sagisawa`・og:type `website`・og:locale `ja_JP`・og:title・og:description・og:url `https://sagisawa.0am.jp/tetris/`・og:image `https://sagisawa.0am.jp/tetris/og.png`〔1200×630、image/png、alt あり〕・twitter:card `summary_large_image`・twitter:title/description/image、name="description"、canonical。形は `Muratam/sagisawa` の `portal/home/src/og.ts` に揃えた）。画像は `public/og.png`（「試す」でサンプルを 4 ステップ進めた画面（盤面・コード・デバッグ）に、sagisawa のダークテーマの帯〔鷺の印・アプリ名・説明・URL〕を重ねたもの）。作り直しは `scripts/og-image.mjs`（先頭のコメントの手順: build → `vite preview` → `node scripts/og-image.mjs http://localhost:4173`。Playwright は管理者AI のサーバーの `~/.local/share/sagisawa-admin/screenshot`）。文言を変えたら `index.html` と `scripts/og-image.mjs` の CARD を合わせる。`scripts/smoke.sh` が head のメタ（URL は絶対 URL）と画像（200・image/png・1200×630）を確認する
- **デプロイ**: master にマージしてから（PR）、ラボで `scripts/deploy-lab.sh`。`/tetris/api/health` が 200 を返すことを確認する。
  - murata: `sudo incus exec --project user-1001 apps -- /srv/tetris-esolang/scripts/deploy-lab.sh`
  - 管理者AI: `incus exec apps -- /srv/tetris-esolang/scripts/deploy-lab.sh`
- **公開**: `sagisawa-expose add tetris 10.44.135.10:3160 --kind public`

## 3. 気づいたこと
- 例の 2 つ目（コメントつきの cat）は、10 行目の `I:AA<<<` のために入力ではなく文字コード 1 を出し続ける（`I:<<<` なら cat になる）。例のコードは変えず、説明にそう書いた（修正するかは murata に聞く）

## 4. 残作業（初回の配置。T380 の後）
1. push 用のデプロイキーを登録し（murata）、`/home/claude/tetris-esolang` の origin を `git@github-tetris:Muratam/tetris-esolang.git` にする
2. この変更を master にマージする（PR）
3. ラボで clone: `incus exec apps -- git clone https://github.com/Muratam/tetris-esolang.git /srv/tetris-esolang`
4. 初回のデプロイ: `incus exec apps -- /srv/tetris-esolang/scripts/deploy-lab.sh` → `incus exec apps -- /srv/tetris-esolang/scripts/smoke.sh http://10.44.135.10:3160`（Docker のイメージのビルドはここで初めて確認する）
5. 公開: `sudo -n /usr/local/sbin/sagisawa-expose add tetris 10.44.135.10:3160 --kind public` → `scripts/smoke.sh https://sagisawa.0am.jp`
6. `Muratam/sagisawa-admin` の `inventory.md` に追記する。ポータル・ホームのアプリの一覧（`Muratam/sagisawa` の `portal/home/src/apps.ts`）に載せるかは murata に聞く

import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  // 公開のパス（https://sagisawa.0am.jp/tetris/）。nginx の設定（docker/nginx.conf）と合わせる
  base: "/tetris/",
  plugins: [vue()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  test: {
    include: ["test/**/*.test.ts"],
    testTimeout: 60_000,
  },
});

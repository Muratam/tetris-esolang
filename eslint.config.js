import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "utils/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // 実行系は元の版（webpack の版）から中身を変えずに移したもの。書き方の指摘で中身を変えない
    files: ["src/tetriscore.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "use-isnan": "off",
      "prefer-const": "off",
    },
  },
);

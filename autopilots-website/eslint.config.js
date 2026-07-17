import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/**", "node_modules/**", "docs/qa/**", "public/**"] },
  js.configs.recommended,
  {
    files: [
      "scripts/**/*.mjs",
      "netlify/functions/**/*.mjs",
      "tests/**/*.mjs",
      "*.js",
      "*.ts",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
    rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] },
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  {
    files: ["netlify/functions/_shared/security.mjs"],
    rules: { "no-control-regex": "off" },
  },
];

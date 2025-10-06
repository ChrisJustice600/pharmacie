import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/no-unescaped-entities": 0,
      "react-hooks/exhaustive-deps": 0,
      "@typescript-eslint/no-unused-vars": 0,
    },
  },
  {
    ignores: ["lib/generated/**/*"],
  },
];

export default eslintConfig;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

/**
 * eslint-config-next 15.5 still ships eslintrc-style configs (its `extends`
 * entries use "plugin:..." strings), so they cannot be dropped into a flat
 * config directly. FlatCompat translates them.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Node CLI tooling — CommonJS by design, not part of the app bundle.
      "scripts/**",
    ],
  },
];

export default eslintConfig;

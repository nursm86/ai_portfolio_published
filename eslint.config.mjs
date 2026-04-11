import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Forbid stray console.log before prod deploy (global rule).
    // `warn` and `error` are allowed, and use the pino logger from @/lib/logger
    // for anything that needs to persist.
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    // Generated Prisma client is noisy — exclude from lint.
    ignores: ["src/generated/**"],
  },
];

export default eslintConfig;

# @planx/eslint-config

Shared [ESLint](https://eslint.org) config for the planx-new monorepo.

## Exports

The presets are split by **toolchain/framework concern**, not by app, so each workspace composes the rules that apply to it. They're independent (a Node app can use `vitest` without `react`), and app-specific policy (e.g. the Editor's MUI rules) lives in that app's own `eslint.config.mjs`, not here.

| Export | Applies to | Contents |
| --- | --- | --- |
| `./base` | every TS workspace | `@eslint/js` recommended + typescript-eslint recommended + shared rules + `eslint-config-prettier` last. |
| `./react` | React component code (Editor, LPS islands) | `base` + jsx-a11y, react-hooks, `@tanstack/eslint-plugin-query`, jest-dom, Vitest. |
| `./playwright` | Playwright tests (e2e ui) | `eslint-plugin-playwright` recommended |
| `./vitest` | test files (Editor, API, Hasura tests) | A function (`vitestConfig()`) returning Vitest rules scoped to test files. Pass extra assertion helpers (e.g. Supertest's `get.expect`) so `expect-expect` doesn't flag them. |

## Usage

Add the dependency:

```jsonc
{
  "devDependencies": {
    "@planx/eslint-config": "workspace:*",
    "eslint": "catalog:"
  }
}
```

Then create an `eslint.config.mjs` in the workspace. Examples:

```js
// apps/editor.planx.uk/eslint.config.mjs
import react from "@planx/eslint-config/react";

export default [
  { ignores: ["**/routeTree.gen.ts", "dist/**", "build/**"] },
  ...react,
];
```

```js
// apps/api.planx.uk/eslint.config.mjs — base + Vitest with Supertest assertions
import base from "@planx/eslint-config/base";
import vitestConfig from "@planx/eslint-config/vitest";
import globals from "globals";

export default [
  { ignores: ["dist/**"] },
  ...base,
  { languageOptions: { globals: { ...globals.node } } },
  ...vitestConfig(["expect", "get.expect", "post.expect", "supertest.**.expect"]),
];
```

## Running from the repo root (lint-staged)

Flat config resolves from the **current working directory**, not per-file. Each workspace's `pnpm lint` runs ESLint from that workspace, so it finds and uses the local
`eslint.config.mjs`.

The pre-commit hook (Husky) is different: git runs it from the repo root, where there's no ESLint config. So the root `lint-staged` command uses the
[`v10_config_lookup_from_file`](https://eslint.org/docs/latest/use/configure/migration-guide) flag, which makes ESLint look up config from each file's own directory.

## Conventions

- Config files are `.js` ESM (ESLint doesn't consume `.ts` config without a build step).
- ESLint plugins are declared as dependencies of this package (not the apps themselves), so consuming workspaces only need `@planx/eslint-config` + `eslint`.
# @planx/typescript-config

Shared [TypeScript](https://www.typescriptlang.org) configs for the planx-new monorepo.

## Configs

The presets config files are split by toolchain, not by application, so each workspace extends the config that applies to it. `base` holds only the options that are universal across every workspace,. App-specific config (`include`/`exclude`/`paths`/`types` and per-app emit directories) stay in that workspace's own `tsconfig.json`.

## Usage

Add the dependency -

```json
{
  "devDependencies": {
    "@planx/typescript-config": "workspace:*",
    "typescript": "catalog:typescript"
  }
}
```

Then extend the config from the workspace's `tsconfig.json`, keeping only the workspace-specific parts locally -

```jsonc
// apps/api.planx.uk/tsconfig.json
{
  "extends": "@planx/typescript-config/node.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": ".",
    "verbatimModuleSyntax": true,
    "types": ["vitest/globals"],
  },
  "exclude": ["node_modules", "dist"],
}
```

```jsonc
// apps/localplanning.services/tsconfig.json
// Astro config is added last to stay authoritative
{
  "extends": [
    "@planx/typescript-config/base.json",
    "astro/tsconfigs/strictest",
  ],
  "compilerOptions": { "paths": { "@lib/*": ["src/lib/*"] } },
  "include": [".astro/types.d.ts", "**/*"],
}
```

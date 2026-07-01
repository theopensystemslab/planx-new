# @planx/prettier-config

Shared [Prettier](https://prettier.io) configuration for the planx-new monorepo.

These options codify Prettier's defaults explicitly so formatting is stable and
discoverable. Tweak here to change formatting across every consuming workspace.

## Usage

Add the dependency and reference it from `package.json`:

```json
{
  "prettier": "@planx/prettier-config",
  "devDependencies": {
    "@planx/prettier-config": "workspace:*"
  }
}
```

Prettier resolves the named module automatically - no `prettier.config.js` needed.

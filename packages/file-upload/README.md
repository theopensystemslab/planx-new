# @planx/file-upload

Exports constants related to file uploads, for consumption by the API and Editor.

## Build

This package is consumed via its `dist/`, so it must be built before any consumer's own build/typecheck can resolve it. `pnpm install` only _symlinks_ workspace packages — it never builds them — so the build is wired up in three places:

1. **Turborepo's `^build`** handles anything routed through turbo: root `pnpm build`/`typecheck`/`test`/`check`, plus `editor.planx.uk`'s `pnpm start` and `pnpm storybook` and `api.planx.uk`'s `pnpm dev`, which all delegate to `turbo run <task> --filter=<app>` against a task definition that depends on `^build`. Raw invocations (`vite`, `vitest`, `tsc --noEmit`, or an IDE's language server) do _not_ get this, motivating (2).

2. **`scripts/build-packages.sh`** runs `turbo run build --filter="./packages/*"` and is hooked to the root `postinstall`, the root `prestart`, `.husky/post-merge` and `scripts/start-containers-for-dev.sh`. This covers fresh clones, dependency changes _and_ pulling `main` when the lockfile hasn't changed. It no-ops in CI (every workflow builds explicitly via turbo) and when package sources aren't present (e.g. when Docker images install before copying full source).

3. **Docker builds** don't inherit either, so `apps/api.planx.uk/Dockerfile` filters with `pnpm --filter api.planx.uk...` to build this package first.

## The API dev container

`apps/api.planx.uk`'s image bakes in an _injected copy_ of this package's `dist/`, pinned inside an anonymous `/api/node_modules` volume that survives `--force-recreate`.

That copy does not track changes to this package — `docker-compose.local.yml` therefore bind-mounts this package over that copy, so the dev container always reads the host's `dist/`.

## Editing this package

Consumers read `dist/`, never the TS source, so an edit here is invisible everywhere until the package is rebuilt. Nothing rebuilds it _on save_ — the hooks above all fire at specific junctures (e.g. `pnpm i`, `git pull`, `pnpm dev`).

If you do want edits to reflect live in `dist/` on save, run `pnpm watch:packages` from root in a second shell. Once `dist/` is rebuilt, the two consumers acknowledge it by different methods:

- The **Editor** picks it up picks it up thanks to Vite, which resolves this package to its real path outside `node_modules` and serves it as source, so will be subject to HMR (hot module replacement) without dev-server restart.
- The **API**'s `tsx watch ...` script explicitly includes build files in `./packages/`, so that the container will also restart on any `dist/` rebuilds (as it will for any edit in `api.planx.uk/` proper).

# @planx/file-upload

Exports constants related to file uploads, for consumption by the API and Editor.

## Build

This package is consumed via its `dist/`, so it must be built before any consumer's own
build/typecheck can resolve it. `pnpm install` only _symlinks_ workspace packages — it never
builds them — so the build is wired up in three places:

1. **`scripts/build-packages.sh`** runs `turbo run build --filter="./packages/*"` and is hooked to
   the root `postinstall`, the root `prestart`, `.husky/post-merge` and `scripts/start-containers-for-dev.sh`.
   This covers fresh clones, dependency changes and — importantly — pulling `main` when the
   lockfile hasn't changed. It no-ops in CI (every workflow builds explicitly via turbo) and when
   package sources aren't present (Docker image builds install before copying source).
2. **Turborepo's `^build`** remains the real guarantee for anything routed through turbo: root
   `pnpm build`/`typecheck`/`test`/`check`, plus `editor.planx.uk`'s `pnpm start` and `pnpm storybook`
   and `api.planx.uk`'s `pnpm dev`, which all delegate to `turbo run <task> --filter=<app>` against a
   task definition that depends on `^build`. Raw invocations (`vite`, `vitest`, `tsc --noEmit`, your
   editor's tsserver) do _not_ get this, which is why (1) exists.
3. **Docker builds** don't inherit either, so `apps/api.planx.uk/Dockerfile` filters with
   `pnpm --filter api.planx.uk...` to build this package first.

## The API dev container

`apps/api.planx.uk`'s image bakes in an _injected copy_ of this package's `dist/`
(`pnpm deploy --inject-workspace-packages`), pinned inside an anonymous `/api/node_modules` volume
that survives `--force-recreate`. That copy goes stale the moment this package gains an export —
the classic symptom being `SyntaxError: The requested module '@planx/file-upload' does not provide
an export named '…'` that neither `pnpm stop`/`pnpm start` nor `pnpm dev` clears.

`docker-compose.local.yml` therefore bind-mounts this package over that copy, so the dev container
always reads the host's `dist/`. After rebuilding the package, `docker compose … restart api` to
pick it up — `tsx watch` ignores `node_modules`, so it won't restart on its own. The mount is
dev-only; production, e2e and pizza stacks never load that compose file and keep using the baked copy.

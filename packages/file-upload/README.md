# @planx/file-upload

Exports constants related to file uploads, for consumption by the API and Editor.

## Build

This package must be built (`pnpm --filter @planx/file-upload build`) before any consumer's own build/typecheck can resolve it. This happens automatically as part of a root-level `pnpm build`, since Turborepo builds workspace dependencies first (`^build`).

NB. This does not currently happen for Docker builds, so `apps/api.planx.uk/Dockerfile` filters with `pnpm --filter api.planx.uk...` to build this package first too.

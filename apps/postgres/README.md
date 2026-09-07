# Postgres image

PostgreSQL 16 + PostGIS + [pg_cron](https://github.com/citusdata/pg_cron). Used by local dev, E2E/CI, and Pizza (Vultr) stacks via `docker-compose.yml`. Staging and Production use a managed AWS RDS instance, not this image.

## Why it's prebuilt and published

`pg_cron` isn't in the base image, so the `Dockerfile` compiles it from source - which means installing a large apt toolchain (`build-essential`, `postgresql-server-dev-16`, `llvm`, etc) from the Debian mirrors.

Doing this on every CI run (from scratch, no layer cache) made the test job flaky. If `deb.debian.org` had issues this could needlessly block PRs, Vults, and Regression Test for hours.

Our solution is to build the image once and publish it to [GHCR](ghcr.io/theopensystemslab/planx-postgres). All stacks then just pull this pre-built image. We only rebuild when there's a change in `/apps/postgres`

## Publishing

This is handled by `.github/workflows/build-postgres-image.yml`.

Pushes to `main` with changes within `/apps/postgres` will rebuild and push the `:latest` image.

The package is public, so other GHA pulls do not need no auth to access it.

## Commands

You can also build locally (e.g. after editing the `Dockerfile`) to test local changes - 

```bash
docker build --platform linux/amd64 -t ghcr.io/theopensystemslab/planx-postgres:latest apps/postgres
```

You can also manuallu publish (normally the workflow does this on merge, see above). This will need a GitHub PAT with `write:packages` permissions, use this as the `Password:` field when prompted - 

```bash
docker login ghcr.io -u <github-username>
docker push ghcr.io/theopensystemslab/planx-postgres:latest
```

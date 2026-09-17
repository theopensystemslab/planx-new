# 13. Replace MinIO with SeaweedFS for local S3 emulation

Date: 2026-09-17

## Status

Approved

## Context

The local dev and e2e Docker stacks run an S3-compatible object store (`mock-services` profile) so the API can run without real AWS credentials. Pizzas, staging and production use real S3 (see `isLiveEnv()`).

That store has been MinIO, pinned to a 2021 image. In April 2026 the `minio/minio` repository was archived and community releases stopped. The last published container image (Sept 2025) predates the final CVE fix and has no admin console. They've also now pulled the image from the Docker Hub, so consumers are expected to build it from source.

The S3 surface the API uses against the mock is small: `putObject`, `getObject`, `headObject`, `deleteObjects`, and presigned `GetObject` URLs. Object tagging is only exercised when `ENFORCE_SCAN_FROM` is set, which is not the case locally.

Clearly, the MinIO solution has run out of road, so we consider alternatives here. 

### Options considered

| Option | Verdict | Notes |
| --- | --- | --- |
| MinIO | Rejected | We could build from source, but the project is essentially abandoned/deprecated, so no further security fixes should be expected. |
| LocalStack | Rejected | Free tier is non-commercial only (which we may or may not qualify for) since March 2026, needs an auth token, and the community image is itself unmaintained. |
| RustFS | Rejected | A promising project in early stage. Governance and commercial model remains unclear, and we'd like to avoid committing to another project with risk of rug-pull. |
| **SeaweedFS** (Apache 2.0) | **Adopted** | `weed mini` runs as a single zero-config container. Credentials and bucket can be seeded from env vars, it supports every S3 call we make, includes tagging and ACL headers, and ships an admin UI. One risk is that the bus factor is basically 1, i.e. there is one primary maintainer. |
| **Garage** (AGPL) | **Fallback** | Project by a grant-funded EU non-profit — more structurally resistant to a licence change or rug pull, and credible as self-hosted S3. Bootstraps a single node + key + bucket from env vars, but needs a committed `garage.toml`, a matching `s3_region`, and returns 501 for object tagging and ACLs. |

## Decision

Replace MinIO with **SeaweedFS (`weed mini`)** in the local and e2e stacks. It is the lowest-friction drop-in with parity to MinIO: no config file, full coverage of our S3 calls, and a UI for debugging. As is usual practice, we should the SeaweedFS image to an explicit version — `weed mini` defaults can change between releases.

Keep **Garage** on hand as a fallback option. If SeaweedFS is abandoned, relicensed, or its community image stops being maintained, we can switch to Garage. Garage is also an interesting candidate if we ever wanted to run our own S3-compatible storage in production or reduce our dependence on AWS.

To future proof any future switch, application code should be agnostic of the S3 emulator/storage backend we are opting for. For example, we can:

- Name the API config helper for what it does e.g. `useLocalS3()`
- Use generic env var names e.g. `S3_MOCK_PORT` rather than `MINIO_*` / `SEAWEEDFS_*`

## Consequences

- Swapping the mock backend later should be a `docker-compose.yml` change plus one hostname in a unit test, not an application change.
- The mock covers the full S3 surface we use today, so local behaviour stays close to real S3, including the scan-tagging code paths.
- A future move to Garage would mean accepting 501s for tagging/ACL locally, gating `ACL: public-read` on `isLiveEnv()`, and adding a small config file - unless they've added that feature in the meantime.

## Note on LocalStack

LocalStack was rejected above for our purposes here (a straightforward S3 mock), but it could address a different, larger problem space: emulating our entire AWS environment/stack locally (e.g. S3, CloudFront, Lambdas, RDS, etc.) so that the Pulumi stacks in `infrastructure/` can be previewed and tested without touching real cloud resources.

It has [first-class Pulumi integration](https://docs.localstack.cloud/aws/connecting/infrastructure-as-code/pulumi/) for this. If we ever want that capability, it would be a separate decision with its own licensing/cost trade-off, and it would sit alongside the S3 mock rather than replace it.

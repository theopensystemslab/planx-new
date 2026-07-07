# AGENTS.md

Guidance for AI coding agents working in this repository. See `README.md` for human-oriented setup instructions; this file focuses on conventions that aren't obvious from a quick read of the code.

## Monorepo layout

pnpm workspace (`pnpm-workspace.yaml`), package manager pinned to `pnpm@10.30.2`.

- `apps/editor.planx.uk` — React/TypeScript frontend. Two environments in one app: the "editor" (service designers) and "preview" (public applicants). MUI v9 + GOV.UK design system patterns.
- `apps/api.planx.uk` — Node/Express REST API. Modular structure (`modules/<name>/{routes,middleware,controller,service}.ts`), see [ADR 0007](doc/architecture/decisions/0007-modularise-express-application.md).
- `apps/hasura.planx.uk` — Hasura GraphQL engine config/metadata + tests for the Postgres database.
- `apps/sharedb.planx.uk` — ShareDB (JSON OT) server for realtime collaborative editing in the editor.
- `apps/localplanning.services` — Astro site, public directory of PlanX services.
- `e2e` — Playwright ("ui-driven") and Gherkin ("api-driven") end-to-end suites.
- `infrastructure` — Pulumi IaC.
- `doc/` — architecture decision records (`doc/architecture/decisions`), guides, how-tos. **Check here before assuming a convention** — several are already documented, e.g. `doc/guides/data-fetching-and-state-management.md`.

Shared dependency versions are pinned via `catalog:`/`catalog:<name>` entries in `pnpm-workspace.yaml` (e.g. `catalog:`, `catalog:lodash`, `catalog:sharedb`, `catalog:typescript`) — when adding one of those deps to a package, reference the catalog rather than pinning a fresh version.

## Client state: Zustand (`apps/editor.planx.uk`)

The full write-up lives at [`doc/guides/data-fetching-and-state-management.md`](doc/guides/data-fetching-and-state-management.md) and [ADR 0011](doc/architecture/decisions/0011-standardised-data-fetching-and-state-management.md) — read those before touching store code. Summary:

**Decision tree for new state:**
- GraphQL data (Hasura) → Apollo Client `useQuery`/`useMutation`
- REST data → TanStack Query, via the typed API layer in `src/lib/api`, never `axios` directly in components
- UI state (modals, sidebar, clipboard) → Zustand
- Flow-graph state (breadcrumbs, passport, current node) → Zustand

**Critical rule: do not put server data in Zustand.** Storing `teamSettings`, `teamMembers`, `planningConstraints`, etc. in the global store is the "God Store" anti-pattern that ADR 0011 is actively migrating *away* from — don't add more of it. Server data belongs in the Apollo/TanStack Query cache; Zustand is for client/UI state and derived flow data.

**Structure** — the store lives in `apps/editor.planx.uk/src/pages/FlowEditor/lib/store/` as a set of slices combined in `index.ts`:

- `shared.ts`, `preview.ts`, `navigation.ts`, `settings.ts`, `team.ts` — used by both public preview and editor
- `editor.ts`, `user.ts`, `auth.ts` — editor-only (do things like connect to ShareDB; not loaded on public preview domains)

`index.ts` builds two stores depending on context (`isPreviewOnlyDomain` / URL contains `/published`):
- `createPublicStore()` — only the public slices, typed as `PublicStore`
- `createFullStore()` — every slice, typed as `FullStore`

Both are exposed as the single `useStore` export, and it's also attached to `window.api` for debugging in the console. When adding new store state, add it to the correct slice (public vs. editor-only) and extend the relevant interface (`SharedStore`, `EditorStore`, etc.) — don't bypass the slice pattern with ad hoc `useStore.setState`/`getState` calls scattered around unless it's a simple, well-scoped side-effect (see the TanStack Query mutation example in the guide).

Slices are typed `StateCreator<ThisSlice & OtherSlicesItDependsOn, [], [], ThisSlice>` (see `shared.ts`, which depends on `NavigationStore`) — this lets one slice call `get()` and read state defined in another slice while keeping its own exported type narrow.

Some slices use the `zustand/persist` middleware (e.g. `editorUIStore` in `editor.ts` for `showSidebar`) — check the existing slice before assuming state should be persisted to storage.

**Testing:** don't mock the store's state directly (unless testing genuinely complex graph logic) and don't mock hooks — mock the network with MSW instead. See the guide for MSW examples with both REST (`http.get`) and GraphQL (`graphql.query`) handlers, using `server.use(...handlers)` in `beforeEach`.

## Tooling conventions

**Dates — `date-fns`, not `Date` methods or Moment/Luxon.** Used throughout both `editor.planx.uk` and `api.planx.uk` (e.g. `format`, `subDays`). Prefer composing `date-fns` functions over manual date arithmetic or custom formatting strings.

**MUI v9** (`^9.0.0`, not v5 — this is a common trap): sub-component prop APIs have moved to `slotProps`.
- `PaperProps` on `Dialog` → `slotProps={{ paper: {...} }}`
- `InputProps` on `TextField` → `slotProps={{ input: {...} }}`
- Don't set `fontWeight="bold"` directly on `Typography` — use `sx={{ fontWeight: "bold" }}`
- Icons from the `ICONS` map (`@planx/components/shared/icons.tsx`) render as `<Icon />` without an `sx` prop, or you'll get TS overload errors.

**Routing** — TanStack Router, file-based under `apps/editor.planx.uk/src/routes/`. Editor node routes live under `_authenticated/app/$team/$flow/_flowEditor/nodes/`.

**Imports** — no `src/`-relative `../../../` alias config beyond `baseUrl`; imports like `pages/FlowEditor/lib/store` or `ui/shared/...` are absolute from `src/` via `vite-tsconfig-paths`. Match this style rather than introducing new alias schemes.

**Component type data** — `pages/FlowEditor/data/types.ts` (`SLUGS`, `fromSlug`) maps component type slugs to `ComponentType`; form editors per type are registered in `pages/FlowEditor/components/forms/index.ts`.

**Testing** — Vitest everywhere (`editor.planx.uk`, `api.planx.uk`), Playwright + Gherkin for `e2e`. `api.planx.uk` tests run with `TZ=Europe/London` pinned — don't assume UTC when writing date-sensitive backend tests.

**Linting/formatting** — ESLint (flat config, `eslint.config.*`) + Prettier per-package, wired into `lint-staged`/Husky at the repo root. Run `pnpm lint:fix` (or the package's `check` script, which also runs `tsc --noEmit`) rather than hand-formatting.

**Hasura clients** (`api.planx.uk`) — multiple clients exported from `client/index.ts` (`$api`, `$public`, `$admin`, ...) for different auth contexts; pick the least-privileged one that works, don't default to an elevated client out of convenience.

## Before assuming a pattern

This is a large, actively-migrating codebase (see the "Legacy patterns to avoid" section of the data-fetching guide for state/data-fetching specifically). If something looks off — a God Store, `axios` called straight from a component, mocked hook implementations in tests — check whether it's a documented anti-pattern before copying it into new code.

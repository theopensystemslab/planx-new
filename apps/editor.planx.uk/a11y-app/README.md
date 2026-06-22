# a11y-app

A local dev tool for running and browsing accessibility test results across all Storybook stories in the editor.

## How to run

From `apps/editor.planx.uk/`:

```sh
# Start the a11y app (port 3001)
pnpm a11y-app
```

Open http://localhost:3001 in your browser, then click **Run tests** to execute the full Storybook a11y test suite. Results are streamed live and displayed as a report once the run completes.

You can also pre-generate results without opening the app:

```sh
pnpm a11y-report
```

This runs `test-storybook` and writes `a11y-app/vitest-results.json`. The app will load that file automatically on next open.

> **Note:** Storybook must not be running on port 6006 when you use `pnpm a11y-report` — the test runner starts its own Storybook instance.

## How it works

### Test runner (`pnpm test-storybook`)

Vitest runs the `@storybook/addon-a11y` accessibility checks across every story using axe-core. Results are written to `a11y-app/vitest-results.json` in Vitest's JSON reporter format.

### Dev server (`pnpm a11y-app`)

A Vite plugin (`a11y-app/vite.config.ts`) adds three API routes to the dev server:

| Route | Method | Purpose |
|---|---|---|
| `/api/results` | GET | Serve the current `vitest-results.json` |
| `/api/run` | POST | Spawn `pnpm test-storybook` as a child process |
| `/api/stream` | GET | SSE stream of stdout/stderr from the running test process |

### React app

The app (`src/App.tsx`) fetches `/api/results` on load and renders the violations grouped by audience and rule. Clicking **Run tests** calls `/api/run` then subscribes to `/api/stream` for live log output.

Violations are parsed from the Vitest JSON report in `src/shared/parseViolations.ts`, which extracts axe-core rule violations from failed test `failureMessages`.

### Audience classification

Components are classified as either `public` (citizen-facing forms) or `editor` (council officer / admin UI) based on their story file path:

- `@planx/components/*/Public` → **public**
- `pages/FlowEditor/`, `ui/editor/`, etc. → **editor**
- Everything else defaults to **public**

This classification drives the "Summary by audience" section of the report.

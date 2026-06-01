/// <reference types="node" />
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const INPUT = path.join(process.cwd(), "a11y-report/vitest-results.json");
const OUTPUT = path.join(process.cwd(), "a11y-report/report.html");

interface AssertionResult {
  ancestorTitles: string[];
  fullName: string;
  title: string;
  status: "passed" | "failed" | "pending";
  duration: number;
  failureMessages: string[];
}

interface SuiteResult {
  name: string;
  status: "passed" | "failed";
  assertionResults: AssertionResult[];
}

interface VitestReport {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  testResults: SuiteResult[];
}

interface Violation {
  impact: "critical" | "serious" | "moderate" | "minor";
  ruleId: string;
  description: string;
  component: string;
  story: string;
}

const IMPACT_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const IMPACT_COLOUR: Record<string, string> = {
  critical: "#b71c1c",
  serious: "#e65100",
  moderate: "#f9a825",
  minor: "#1b5e20",
};

const IMPACT_BG: Record<string, string> = {
  critical: "#ffebee",
  serious: "#fff3e0",
  moderate: "#fffde7",
  minor: "#e8f5e9",
};

const VIOLATION_RE = /\[(critical|serious|moderate|minor)\] (\S+):/g;

function componentName(suitePath: string): string {
  return suitePath
    .replace(/.*\/src\//, "")
    .replace(/\/index\.stories\.tsx$/, "")
    .replace(/\.stories\.tsx$/, "");
}

function parseViolations(report: VitestReport): Violation[] {
  const violations: Violation[] = [];
  for (const suite of report.testResults) {
    const comp = componentName(suite.name);
    for (const ar of suite.assertionResults ?? []) {
      if (ar.status !== "failed") continue;
      for (const msg of ar.failureMessages) {
        let match: RegExpExecArray | null;
        VIOLATION_RE.lastIndex = 0;
        while ((match = VIOLATION_RE.exec(msg)) !== null) {
          const [, impact, ruleId] = match;
          const descStart = match.index + match[0].length;
          const descEnd = msg.indexOf("\n", descStart);
          const description =
            descEnd === -1
              ? msg.slice(descStart).trim()
              : msg.slice(descStart, descEnd).trim();
          violations.push({
            impact: impact as Violation["impact"],
            ruleId,
            description,
            component: comp,
            story: ar.fullName || ar.title,
          });
        }
      }
    }
  }
  return violations;
}

function groupBy<T, K extends string>(
  items: T[],
  key: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

function badge(impact: string): string {
  const colour = IMPACT_COLOUR[impact] ?? "#666";
  return `<span class="badge" style="background:${colour}">${impact}</span>`;
}

function generateHtml(report: VitestReport): string {
  const allViolations = parseViolations(report);
  allViolations.sort(
    (a, b) => (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9),
  );

  const byRule = groupBy(allViolations, (v) => v.ruleId);
  const byComponent = groupBy(allViolations, (v) => v.component);

  const impactCounts: Record<string, number> = {};
  for (const v of allViolations) {
    impactCounts[v.impact] = (impactCounts[v.impact] ?? 0) + 1;
  }

  const date = new Date().toISOString().split("T")[0];
  const uniqueRules = byRule.size;
  const affectedComponents = byComponent.size;

  // ── Summary cards ──────────────────────────────────────────────────────────
  const summaryCards = ["critical", "serious", "moderate", "minor"]
    .map((impact) => {
      const count = impactCounts[impact] ?? 0;
      const colour = IMPACT_COLOUR[impact];
      const bg = IMPACT_BG[impact];
      return `
        <div class="card" style="border-left: 4px solid ${colour}; background: ${bg}">
          <div class="card-count" style="color:${colour}">${count}</div>
          <div class="card-label">${impact}</div>
        </div>`;
    })
    .join("");

  // ── By-rule section ────────────────────────────────────────────────────────
  const rulesSorted = [...byRule.entries()].sort(
    (a, b) =>
      (IMPACT_ORDER[a[1][0].impact] ?? 9) -
        (IMPACT_ORDER[b[1][0].impact] ?? 9) || b[1].length - a[1].length,
  );

  const rulesHtml = rulesSorted
    .map(([ruleId, instances]) => {
      const { impact, description } = instances[0];
      const colour = IMPACT_COLOUR[impact];
      const comps = [...new Set(instances.map((v) => v.component))].sort();
      return `
      <details>
        <summary>
          ${badge(impact)}
          <strong>${ruleId}</strong> — ${description}
          <span class="count">${instances.length} instance${instances.length !== 1 ? "s" : ""} across ${comps.length} component${comps.length !== 1 ? "s" : ""}</span>
        </summary>
        <ul class="comp-list">
          ${comps.map((c) => `<li>${c}</li>`).join("")}
        </ul>
      </details>`;
    })
    .join("\n");

  // ── By-component section ───────────────────────────────────────────────────
  const compsSorted = [...byComponent.entries()].sort((a, b) => {
    const aWorst = Math.min(...a[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
    const bWorst = Math.min(...b[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
    return aWorst - bWorst || b[1].length - a[1].length;
  });

  const compsHtml = compsSorted
    .map(([comp, violations]) => {
      const worstImpact = violations.reduce(
        (best, v) =>
          (IMPACT_ORDER[v.impact] ?? 9) < (IMPACT_ORDER[best] ?? 9)
            ? v.impact
            : best,
        "minor",
      );
      const bg = IMPACT_BG[worstImpact];
      const colour = IMPACT_COLOUR[worstImpact];
      const ruleBreakdown = [...groupBy(violations, (v) => v.ruleId).entries()]
        .sort(
          (a, b) =>
            (IMPACT_ORDER[a[1][0].impact] ?? 9) -
            (IMPACT_ORDER[b[1][0].impact] ?? 9),
        )
        .map(
          ([ruleId, vs]) =>
            `<li>${badge(vs[0].impact)} <code>${ruleId}</code> — ${vs[0].description} <em>(${vs.length}×)</em></li>`,
        )
        .join("");
      return `
      <details>
        <summary style="border-left: 3px solid ${colour}; padding-left: 8px">
          <strong>${comp}</strong>
          <span class="count">${violations.length} violation${violations.length !== 1 ? "s" : ""}</span>
        </summary>
        <ul class="rule-list">${ruleBreakdown}</ul>
      </details>`;
    })
    .join("\n");

  // ── Fix plan ────────────────────────────────────────────────────────────────
  const planItems: Array<{ priority: string; title: string; detail: string }> =
    [
      {
        priority: "P0 — Critical",
        title: "label: Add labels to all unlabelled form elements",
        detail: `<strong>13 components</strong> including Checklist, DrawBoundary, FileUploadAndLabel, Question. Use <code>&lt;label htmlFor&gt;</code> or <code>aria-label</code>/<code>aria-labelledby</code> on every input, select, and textarea. Check MUI TextField usage — ensure <code>label</code> prop or <code>InputLabelProps</code> is set.`,
      },
      {
        priority: "P0 — Critical",
        title: "button-name: Give all icon buttons an accessible name",
        detail: `<strong>7 components</strong> including Checklist, Content, ImgInput. Add <code>aria-label</code> to icon-only <code>&lt;IconButton&gt;</code> instances. MUI's <code>IconButton</code> accepts an <code>aria-label</code> prop directly.`,
      },
      {
        priority: "P1 — Serious",
        title:
          "aria-input-field-name: Ensure every ARIA input field has an accessible name",
        detail: `<strong>31 components</strong>. This often overlaps with <code>label</code> failures. For custom ARIA inputs (<code>role="textbox"</code> etc.) ensure <code>aria-label</code> or <code>aria-labelledby</code> is present. Check generated/dynamic field names in forms.`,
      },
      {
        priority: "P1 — Serious",
        title:
          "nested-interactive: Remove nested interactive controls (26 components)",
        detail: `Buttons and links inside other interactive elements. Common cause: clickable card wrappers containing buttons. Restructure so the outer element is not interactive, or use <code>aria-describedby</code>/<code>aria-labelledby</code> to link the two.`,
      },
      {
        priority: "P1 — Serious",
        title: "color-contrast: Fix insufficient contrast ratios (9 components)",
        detail: `AddressInput, ContactInput, DateInput, Feedback, NumberInput, SetFee, TextInput, EditorNavMenu, FeedbackForm. Use the browser DevTools contrast checker or the axe browser extension to identify specific colour pairs. Adjust MUI theme token values rather than one-off overrides.`,
      },
      {
        priority: "P1 — Serious",
        title:
          "aria-prohibited-attr: Remove prohibited ARIA attributes (6 components)",
        detail: `Checklist, FileUploadAndLabel, Question, ResponsiveChecklist, ResponsiveQuestion, ImgInput. Usually caused by putting <code>aria-label</code> or <code>aria-labelledby</code> on elements whose role doesn't permit them. Check role assignments and remove or move the attribute.`,
      },
      {
        priority: "P2 — Moderate",
        title:
          "region: Wrap page content in landmark regions (60 components — single shared fix)",
        detail: `Almost every story fails this because the Storybook test harness doesn't wrap content in a <code>&lt;main&gt;</code>. The fix is a single change in <strong><code>.storybook/preview.tsx</code></strong>: add a <code>&lt;main&gt;</code> (or appropriate landmark) decorator so all stories render inside one. This will resolve ~162 violations in one go.`,
      },
      {
        priority: "P2 — Moderate",
        title: "heading-order: Fix skipped heading levels (5 components)",
        detail: `DrawBoundary, FileUploadAndLabel, Pay, Result, Section. Ensure headings follow a logical h1→h2→h3 sequence with no skips. Audit the rendered heading hierarchy with browser DevTools.`,
      },
      {
        priority: "P3 — Minor",
        title: "aria-allowed-role / presentation-role-conflict (26 components)",
        detail: `Both violations affect the same 26 components and likely come from the same MUI element. Check for <code>role="presentation"</code> or <code>role="none"</code> on elements that still have <code>tabindex</code> or global ARIA attributes. Often introduced by MUI's internal list/menu structures.`,
      },
    ];

  const planHtml = planItems
    .map((item) => {
      const isP0 = item.priority.includes("P0");
      const isP1 = item.priority.includes("P1");
      const colour = isP0
        ? IMPACT_COLOUR.critical
        : isP1
          ? IMPACT_COLOUR.serious
          : item.priority.includes("P2")
            ? IMPACT_COLOUR.moderate
            : IMPACT_COLOUR.minor;
      return `
      <div class="plan-item">
        <div class="plan-priority" style="background:${colour}">${item.priority}</div>
        <div class="plan-body">
          <strong>${item.title}</strong>
          <p>${item.detail}</p>
        </div>
      </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Accessibility Audit Report — ${date}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 1000px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      color: #1a1a1a;
      line-height: 1.5;
    }
    h1 { margin-bottom: 0.25rem; }
    h2 { margin-top: 2.5rem; border-bottom: 2px solid #eee; padding-bottom: 0.4rem; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 2rem; }

    /* Summary cards */
    .cards { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0 2rem; }
    .card {
      flex: 1 1 130px;
      padding: 1rem 1.25rem;
      border-radius: 6px;
      min-width: 130px;
    }
    .card-count { font-size: 2.5rem; font-weight: 700; line-height: 1; }
    .card-label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }

    /* Stats table */
    .stats { border-collapse: collapse; margin-bottom: 1rem; }
    .stats td, .stats th { border: 1px solid #e0e0e0; padding: 8px 14px; }
    .stats th { background: #f5f5f5; text-align: left; }

    /* Violations */
    details { margin: 6px 0; }
    summary {
      cursor: pointer;
      padding: 8px 6px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      list-style: none;
      user-select: none;
    }
    summary:hover { background: #f8f8f8; }
    summary::-webkit-details-marker { display: none; }
    summary::before { content: "▶"; font-size: 0.7em; color: #999; flex-shrink: 0; }
    details[open] > summary::before { content: "▼"; }

    .badge {
      display: inline-block;
      color: #fff;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }
    .count {
      margin-left: auto;
      font-size: 0.82rem;
      color: #666;
      white-space: nowrap;
    }

    .comp-list, .rule-list {
      margin: 8px 0 8px 24px;
      padding: 0;
    }
    .comp-list li { padding: 3px 0; font-family: monospace; font-size: 0.88em; }
    .rule-list li { padding: 4px 0; font-size: 0.9em; }
    code { background: #f4f4f4; padding: 1px 5px; border-radius: 3px; font-size: 0.85em; }

    /* Fix plan */
    .plan-item {
      display: flex;
      gap: 0;
      margin: 1rem 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
    }
    .plan-priority {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      color: #fff;
      padding: 12px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .plan-body {
      padding: 12px 16px;
      flex: 1;
    }
    .plan-body p { margin: 6px 0 0; font-size: 0.9em; color: #444; }
  </style>
</head>
<body>
  <h1>Accessibility Audit Report</h1>
  <p class="meta">Generated: ${date} &nbsp;·&nbsp; ${report.numTotalTests} stories tested &nbsp;·&nbsp; ${report.numFailedTests} failing &nbsp;·&nbsp; ${uniqueRules} distinct rules &nbsp;·&nbsp; ${affectedComponents} components affected</p>

  <h2>Violation counts by impact</h2>
  <div class="cards">${summaryCards}</div>

  <table class="stats">
    <tr><th>Total stories tested</th><td>${report.numTotalTests}</td></tr>
    <tr><th>Passing</th><td>${report.numPassedTests}</td></tr>
    <tr><th>Failing</th><td>${report.numFailedTests}</td></tr>
    <tr><th>Distinct violation rules</th><td>${uniqueRules}</td></tr>
    <tr><th>Components affected</th><td>${affectedComponents}</td></tr>
    <tr><th>Total violation instances</th><td>${allViolations.length}</td></tr>
  </table>

  <h2>Violations by rule</h2>
  <p>Click a rule to see which components are affected.</p>
  ${rulesHtml}

  <h2>Violations by component</h2>
  <p>Sorted by worst impact, then total count. Click a component to see its violations.</p>
  ${compsHtml}

  <h2>Fix plan</h2>
  <p>Ordered by priority. Addressing <strong>region</strong> (P2) first is the highest-leverage single change — it resolves ~162 violations across 60 components by updating the Storybook decorator once.</p>
  ${planHtml}
</body>
</html>`;
}

const raw = readFileSync(INPUT, "utf-8");
const report = JSON.parse(raw) as VitestReport;
const html = generateHtml(report);
writeFileSync(OUTPUT, html, "utf-8");

console.log(`Report written to ${OUTPUT}`);
console.log(
  `  ${report.numFailedTests}/${report.numTotalTests} stories failing`,
);

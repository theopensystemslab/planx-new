/// <reference types="node" />
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const INPUT = path.join(process.cwd(), "a11y-app/vitest-results.json");
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

type Audience = "public" | "editor";

interface Violation {
  impact: "critical" | "serious" | "moderate" | "minor";
  ruleId: string;
  description: string;
  component: string;
  story: string;
  audience: Audience;
  nodes: string[];
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

function componentName(suitePath: string): string {
  return suitePath
    .replace(/.*\/src\//, "")
    .replace(/\/index\.stories\.tsx$/, "")
    .replace(/\.stories\.tsx$/, "");
}

function classifyComponent(comp: string): Audience {
  if (comp.includes("@planx/components/")) {
    if (comp.includes("/Public")) return "public";
    if (comp.includes("shared/Preview")) return "public";
    return "editor";
  }
  const editorPrefixes = [
    "pages/FlowEditor/",
    "pages/Dashboard/",
    "pages/Team/",
    "pages/Teams/",
    "pages/Users/",
    "pages/GlobalSettings/",
    "components/EditorNavMenu/",
    "ui/editor/",
  ];
  if (editorPrefixes.some((p) => comp.includes(p))) return "editor";
  return "public";
}

function parseViolations(report: VitestReport): Violation[] {
  const violations: Violation[] = [];

  for (const suite of report.testResults) {
    const comp = componentName(suite.name);
    const audience = classifyComponent(comp);
    for (const ar of suite.assertionResults ?? []) {
      if (ar.status !== "failed") continue;
      for (const msg of ar.failureMessages) {
        const lines = msg.split("\n");
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          const match = line.match(
            /^\[(critical|serious|moderate|minor)\] (\S+): (.+)$/,
          );
          if (match) {
            const [, impact, ruleId, description] = match;
            const nodes: string[] = [];
            i++;
            while (i < lines.length) {
              const next = lines[i];
              // Stack trace lines signal end of violation block
              if (next.startsWith("    at ")) break;
              // Next violation line signals end of current block
              if (/^\[(critical|serious|moderate|minor)\]/.test(next)) break;
              // Indented non-stack lines are node targets
              if (next.startsWith("    ")) {
                const trimmed = next.trim();
                if (trimmed) nodes.push(trimmed);
              }
              i++;
            }
            violations.push({
              impact: impact as Violation["impact"],
              ruleId,
              description: description.trim(),
              component: comp,
              story: ar.fullName || ar.title,
              audience,
              nodes,
            });
          } else {
            i++;
          }
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

function impactCards(violations: Violation[]): string {
  const counts: Record<string, number> = {};
  for (const v of violations) counts[v.impact] = (counts[v.impact] ?? 0) + 1;
  return ["critical", "serious", "moderate", "minor"]
    .map((impact) => {
      const count = counts[impact] ?? 0;
      const colour = IMPACT_COLOUR[impact];
      const bg = IMPACT_BG[impact];
      return `
        <div class="card" style="border-left: 4px solid ${colour}; background: ${bg}">
          <div class="card-count" style="color:${colour}">${count}</div>
          <div class="card-label">${impact}</div>
        </div>`;
    })
    .join("");
}

function byRuleHtml(violations: Violation[]): string {
  const byRule = groupBy(violations, (v) => v.ruleId);
  const sorted = [...byRule.entries()].sort(
    (a, b) =>
      (IMPACT_ORDER[a[1][0].impact] ?? 9) -
        (IMPACT_ORDER[b[1][0].impact] ?? 9) || b[1].length - a[1].length,
  );
  if (sorted.length === 0) return "<p>No violations.</p>";
  return sorted
    .map(([ruleId, instances]) => {
      const { impact, description } = instances[0];
      const byComp = groupBy(instances, (v) => v.component);
      const compsSorted = [...byComp.keys()].sort();
      return `
      <details>
        <summary>
          ${badge(impact)}
          <strong>${ruleId}</strong> — ${description}
          <span class="count">${instances.length} instance${instances.length !== 1 ? "s" : ""} across ${byComp.size} component${byComp.size !== 1 ? "s" : ""}</span>
        </summary>
        <ul class="comp-list">
          ${compsSorted.map((c) => {
            const stories = [...new Set(byComp.get(c)!.map((v) => v.story))].sort();
            return `<li>${c}<ul class="story-sublist">${stories.map((s) => `<li>${s}</li>`).join("")}</ul></li>`;
          }).join("")}
        </ul>
      </details>`;
    })
    .join("\n");
}

function byComponentHtml(violations: Violation[]): string {
  const byComponent = groupBy(violations, (v) => v.component);
  const sorted = [...byComponent.entries()].sort((a, b) => {
    const aWorst = Math.min(...a[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
    const bWorst = Math.min(...b[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
    return aWorst - bWorst || b[1].length - a[1].length;
  });
  if (sorted.length === 0) return "<p>No violations.</p>";

  return sorted
    .map(([comp, vs]) => {
      const worstImpact = vs.reduce(
        (best, v) =>
          (IMPACT_ORDER[v.impact] ?? 9) < (IMPACT_ORDER[best] ?? 9)
            ? v.impact
            : best,
        "minor",
      );
      const colour = IMPACT_COLOUR[worstImpact];

      const byStory = groupBy(vs, (v) => v.story);
      const storyBlocks = [...byStory.entries()]
        .sort((a, b) => {
          const aWorst = Math.min(...a[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
          const bWorst = Math.min(...b[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
          return aWorst - bWorst || b[1].length - a[1].length;
        })
        .map(([story, storyViolations]) => {
          const violationItems = [...storyViolations]
            .sort((a, b) => (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9))
            .map((v) => {
              const nodeItems =
                v.nodes.length > 0
                  ? `<ul class="node-list">${v.nodes.map((n) => `<li><code>${n}</code></li>`).join("")}</ul>`
                  : "";
              return `<div class="violation-item">${badge(v.impact)} <code>${v.ruleId}</code> — ${v.description}${nodeItems}</div>`;
            })
            .join("");
          return `<div class="story-block"><div class="story-name">${story}</div>${violationItems}</div>`;
        })
        .join("");

      return `
      <details>
        <summary style="border-left: 3px solid ${colour}; padding-left: 8px">
          <strong>${comp}</strong>
          <span class="count">${vs.length} violation${vs.length !== 1 ? "s" : ""}</span>
        </summary>
        <div class="story-violations">${storyBlocks}</div>
      </details>`;
    })
    .join("\n");
}

function generateHtml(report: VitestReport): string {
  const allViolations = parseViolations(report);
  allViolations.sort(
    (a, b) => (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9),
  );

  const publicViolations = allViolations.filter((v) => v.audience === "public");
  const editorViolations = allViolations.filter((v) => v.audience === "editor");

  const publicComponents = new Set(publicViolations.map((v) => v.component))
    .size;
  const editorComponents = new Set(editorViolations.map((v) => v.component))
    .size;
  const totalComponents = new Set(allViolations.map((v) => v.component)).size;
  const uniqueRules = new Set(allViolations.map((v) => v.ruleId)).size;

  const date = new Date().toISOString().split("T")[0];

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
      max-width: 1100px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      color: #1a1a1a;
      line-height: 1.5;
    }
    h1 { margin-bottom: 0.25rem; }
    h2 { margin-top: 2.5rem; border-bottom: 2px solid #eee; padding-bottom: 0.4rem; }
    h3 { margin-top: 1.5rem; font-size: 1rem; color: #444; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 2rem; }

    .audience-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 1rem;
    }
    @media (max-width: 700px) { .audience-grid { grid-template-columns: 1fr; } }
    .audience-panel {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1.25rem;
    }
    .audience-panel h3 {
      margin-top: 0;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .aud-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      border-radius: 3px;
      vertical-align: middle;
    }
    .aud-public { background: #e3f2fd; color: #0d47a1; }
    .aud-editor { background: #f3e5f5; color: #6a1b9a; }

    .cards { display: flex; gap: 0.75rem; flex-wrap: wrap; margin: 0.75rem 0 1rem; }
    .card {
      flex: 1 1 110px;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      min-width: 100px;
    }
    .card-count { font-size: 2rem; font-weight: 700; line-height: 1; }
    .card-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }

    .mini-stats { font-size: 0.85em; color: #555; margin: 0 0 0.5rem; }
    .mini-stats span { margin-right: 1rem; }

    .stats { border-collapse: collapse; margin-bottom: 1rem; }
    .stats td, .stats th { border: 1px solid #e0e0e0; padding: 8px 14px; }
    .stats th { background: #f5f5f5; text-align: left; }

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

    .story-sublist { margin: 2px 0 4px; padding-left: 1.2em; list-style: disc; }
    .story-sublist li { font-family: inherit; font-size: 0.85em; color: #555; padding: 1px 0; }
    .comp-list, .rule-list {
      margin: 8px 0 8px 24px;
      padding: 0;
    }
    .comp-list li { padding: 3px 0; font-family: monospace; font-size: 0.88em; }
    .rule-list li { padding: 4px 0; font-size: 0.9em; }
    code { background: #f4f4f4; padding: 1px 5px; border-radius: 3px; font-size: 0.85em; }

    .story-violations { padding: 4px 12px; }
    .story-block { margin: 8px 0; }
    .story-name {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #888;
      margin-bottom: 4px;
    }
    .violation-item {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 0.9em;
    }
    .violation-item:last-child { border-bottom: none; }
    .node-list {
      margin: 6px 0 0 20px;
      padding: 0;
      list-style: disc;
    }
    .node-list li { padding: 2px 0; }
    .node-list code { font-size: 0.82em; word-break: break-all; }
  </style>
</head>
<body>
  <h1>Accessibility Audit Report</h1>
  <p class="meta">Generated: ${date} &nbsp;·&nbsp; ${report.numTotalTests} stories tested &nbsp;·&nbsp; ${report.numFailedTests} failing &nbsp;·&nbsp; ${uniqueRules} distinct rules &nbsp;·&nbsp; ${totalComponents} components affected</p>

  <h2>Summary by audience</h2>
  <div class="audience-grid">
    <div class="audience-panel">
      <h3><span class="aud-badge aud-public">public-facing</span> Citizen form components</h3>
      <p class="mini-stats">
        <span><strong>${publicViolations.length}</strong> violations</span>
        <span><strong>${publicComponents}</strong> components</span>
      </p>
      <div class="cards">${impactCards(publicViolations)}</div>
    </div>
    <div class="audience-panel">
      <h3><span class="aud-badge aud-editor">editor-facing</span> Council / admin UI</h3>
      <p class="mini-stats">
        <span><strong>${editorViolations.length}</strong> violations</span>
        <span><strong>${editorComponents}</strong> components</span>
      </p>
      <div class="cards">${impactCards(editorViolations)}</div>
    </div>
  </div>

  <table class="stats" style="margin-top:1.5rem">
    <tr><th>Total stories tested</th><td>${report.numTotalTests}</td></tr>
    <tr><th>Passing</th><td>${report.numPassedTests}</td></tr>
    <tr><th>Failing</th><td>${report.numFailedTests}</td></tr>
    <tr><th>Distinct violation rules</th><td>${uniqueRules}</td></tr>
    <tr><th>Components affected (total)</th><td>${totalComponents}</td></tr>
    <tr><th>Total violation instances</th><td>${allViolations.length}</td></tr>
  </table>

  <h2><span class="aud-badge aud-public" style="font-size:0.85rem;vertical-align:middle">public-facing</span> Citizen form violations</h2>
  <p>Components shown to citizens filling in planning applications. Failures here have direct impact on end-user accessibility.</p>

  <h3>By rule</h3>
  <p>Click a rule to see which components are affected.</p>
  ${byRuleHtml(publicViolations)}

  <h3>By component</h3>
  <p>Sorted by worst impact. Expand a component to see each story and the specific elements affected.</p>
  ${byComponentHtml(publicViolations)}

  <h2><span class="aud-badge aud-editor" style="font-size:0.85rem;vertical-align:middle">editor-facing</span> Council / admin UI violations</h2>
  <p>Components used by council officers and flow editors. Includes the flow builder, team management, submissions log, dashboard, and settings pages.</p>

  <h3>By rule</h3>
  <p>Click a rule to see which components are affected.</p>
  ${byRuleHtml(editorViolations)}

  <h3>By component</h3>
  <p>Sorted by worst impact. Expand a component to see each story and the specific elements affected.</p>
  ${byComponentHtml(editorViolations)}
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

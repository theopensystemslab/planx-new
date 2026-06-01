/// <reference types="node" />
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import type { Result } from "axe-core";

const STORIES_DIR = path.join(process.cwd(), "a11y-report/stories");
const OUT_DIR = path.join(process.cwd(), "a11y-report");

interface StoryResult {
  id: string;
  title: string;
  name: string;
  violations: Result[];
  error?: string;
}

const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };

function loadResults(): { withViolations: StoryResult[]; withErrors: StoryResult[] } {
  const files = readdirSync(STORIES_DIR).filter((f) => f.endsWith(".json"));
  const all = files
    .map((f) => JSON.parse(readFileSync(path.join(STORIES_DIR, f), "utf-8")) as StoryResult)
    .sort((a, b) => a.title.localeCompare(b.title));
  return {
    withViolations: all.filter((r) => r.violations.length > 0),
    withErrors: all.filter((r) => r.error),
  };
}

function generateMarkdown(results: StoryResult[], errors: StoryResult[], total: number): string {
  const violationCount = results.reduce((acc, r) => acc + r.violations.length, 0);
  const date = new Date().toISOString().split("T")[0];

  const lines: string[] = [
    `# Accessibility Audit Report`,
    ``,
    `Generated: ${date}`,
    ``,
    `## Summary`,
    ``,
    `| | |`,
    `|---|---|`,
    `| Stories checked | ${total} |`,
    `| Stories with violations | ${results.length} |`,
    `| Total violations | ${violationCount} |`,
    `| Stories that errored | ${errors.length} |`,
    ``,
    `## Violations by story`,
    ``,
  ];

  for (const story of results) {
    lines.push(`### ${story.title} / ${story.name}`);
    lines.push(``);

    const sorted = [...story.violations].sort(
      (a, b) =>
        (impactOrder[a.impact as keyof typeof impactOrder] ?? 99) -
        (impactOrder[b.impact as keyof typeof impactOrder] ?? 99),
    );

    for (const v of sorted) {
      lines.push(`- **[${v.impact}] ${v.id}** — ${v.description}`);
      for (const node of v.nodes.slice(0, 3)) {
        lines.push(`  - \`${node.target}\``);
      }
      if (v.nodes.length > 3) {
        lines.push(`  - _...and ${v.nodes.length - 3} more nodes_`);
      }
      lines.push(`  - Help: ${v.helpUrl}`);
    }
    lines.push(``);
  }

  if (errors.length > 0) {
    lines.push(`## Stories that could not be checked`);
    lines.push(``);
    for (const story of errors) {
      lines.push(`- **${story.title} / ${story.name}** — \`${story.error}\``);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

function generateHtml(results: StoryResult[], errors: StoryResult[], total: number): string {
  const violationCount = results.reduce((acc, r) => acc + r.violations.length, 0);
  const date = new Date().toISOString().split("T")[0];

  const impactColour: Record<string, string> = {
    critical: "#d32f2f",
    serious: "#f57c00",
    moderate: "#fbc02d",
    minor: "#388e3c",
  };

  const storyBlocks = results
    .map((story) => {
      const sorted = [...story.violations].sort(
        (a, b) =>
          (impactOrder[a.impact as keyof typeof impactOrder] ?? 99) -
          (impactOrder[b.impact as keyof typeof impactOrder] ?? 99),
      );

      const violationItems = sorted
        .map((v) => {
          const colour = impactColour[v.impact ?? ""] ?? "#666";
          const nodes = v.nodes
            .slice(0, 3)
            .map((n) => `<li><code>${n.target}</code><br><small>${n.html}</small></li>`)
            .join("");
          const more =
            v.nodes.length > 3
              ? `<li><em>...and ${v.nodes.length - 3} more nodes</em></li>`
              : "";
          return `
            <details>
              <summary>
                <span style="background:${colour};color:#fff;padding:2px 6px;border-radius:3px;font-size:0.75em">${v.impact}</span>
                <strong>${v.id}</strong> — ${v.description}
              </summary>
              <ul>${nodes}${more}</ul>
              <p><a href="${v.helpUrl}" target="_blank">More info ↗</a></p>
            </details>`;
        })
        .join("");

      return `
        <section>
          <h3>${story.title} / ${story.name}</h3>
          ${violationItems}
        </section>`;
    })
    .join("<hr>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Accessibility Audit Report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
    summary { cursor: pointer; padding: 6px 0; }
    details { border-left: 3px solid #ddd; margin: 8px 0; padding: 4px 12px; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-size: 0.85em; }
    table { border-collapse: collapse; }
    td, th { border: 1px solid #ddd; padding: 8px 12px; }
    th { background: #f4f4f4; }
    hr { margin: 2rem 0; border: none; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <h1>Accessibility Audit Report</h1>
  <p>Generated: ${date}</p>
  <h2>Summary</h2>
  <table>
    <tr><th>Stories checked</th><td>${total}</td></tr>
    <tr><th>Stories with violations</th><td>${results.length}</td></tr>
    <tr><th>Total violations</th><td>${violationCount}</td></tr>
    <tr><th>Stories that errored</th><td>${errors.length}</td></tr>
  </table>
  <h2>Violations by story</h2>
  ${storyBlocks}
  ${
    errors.length > 0
      ? `<h2>Stories that could not be checked</h2><ul>${errors.map((s) => `<li><strong>${s.title} / ${s.name}</strong> — <code>${s.error}</code></li>`).join("")}</ul>`
      : ""
  }
</body>
</html>`;
}

const { withViolations, withErrors } = loadResults();
const allFiles = readdirSync(STORIES_DIR).filter((f) => f.endsWith(".json"));
const total = allFiles.length;

mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(path.join(OUT_DIR, "report.md"), generateMarkdown(withViolations, withErrors, total));
writeFileSync(path.join(OUT_DIR, "report.html"), generateHtml(withViolations, withErrors, total));

console.log(`Report written to ${OUT_DIR}`);
console.log(`  ${withViolations.length}/${total} stories have violations`);
if (withErrors.length > 0) {
  console.log(`  ${withErrors.length} stories could not be checked (see report for details)`);
}

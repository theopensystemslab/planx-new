import type { Audience, Violation, VitestReport } from "./types";
import { IMPACT_ORDER } from "./types";

export function groupBy<T, K extends string>(
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

export function parseViolations(report: VitestReport): Violation[] {
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
              if (next.startsWith("    at ")) break;
              if (/^\[(critical|serious|moderate|minor)\]/.test(next)) break;
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
              storyId: ar.meta?.storyId ?? "",
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

  return violations.sort(
    (a, b) => (IMPACT_ORDER[a.impact] ?? 9) - (IMPACT_ORDER[b.impact] ?? 9),
  );
}

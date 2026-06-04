import React from "react";
import type { Violation } from "../shared/types";
import { IMPACT_COLOUR, IMPACT_ORDER } from "../shared/types";
import { groupBy } from "../shared/parseViolations";

interface Props {
  violations: Violation[];
}

function Badge({ impact }: { impact: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        color: "#fff",
        padding: "2px 8px",
        borderRadius: 3,
        fontSize: "0.72rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        flexShrink: 0,
        background: IMPACT_COLOUR[impact] ?? "#666",
      }}
    >
      {impact}
    </span>
  );
}

export default function ByRuleList({ violations }: Props) {
  const byRule = groupBy(violations, (v) => v.ruleId);
  const sorted = [...byRule.entries()].sort(
    (a, b) =>
      (IMPACT_ORDER[a[1][0].impact] ?? 9) -
        (IMPACT_ORDER[b[1][0].impact] ?? 9) || b[1].length - a[1].length,
  );

  if (sorted.length === 0) return <p>No violations.</p>;

  return (
    <div>
      {sorted.map(([ruleId, instances]) => {
        const { impact, description } = instances[0];
        const byComp = groupBy(instances, (v) => v.component);
        const compsSorted = [...byComp.keys()].sort();

        return (
          <details key={ruleId}>
            <summary
              style={{
                padding: "8px 6px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Badge impact={impact} />
              <strong>{ruleId}</strong> — {description}
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.82rem",
                  color: "#666",
                  whiteSpace: "nowrap",
                }}
              >
                {instances.length} instance{instances.length !== 1 ? "s" : ""}{" "}
                across {byComp.size} component{byComp.size !== 1 ? "s" : ""}
              </span>
            </summary>
            <ul style={{ margin: "8px 0 8px 24px", padding: 0 }}>
              {compsSorted.map((c) => {
                const compViolations = byComp.get(c)!;
                // Deduplicate stories, preserving one storyId per story name
                const storyMap = new Map<string, string>();
                for (const v of compViolations) storyMap.set(v.story, v.storyId);
                const stories = [...storyMap.entries()].sort(([a], [b]) => a.localeCompare(b));
                return (
                  <li
                    key={c}
                    style={{
                      padding: "3px 0",
                      fontFamily: "monospace",
                      fontSize: "0.88em",
                    }}
                  >
                    {c}
                    <ul
                      style={{
                        margin: "2px 0 4px",
                        paddingLeft: "1.2em",
                        listStyle: "disc",
                      }}
                    >
                      {stories.map(([story, storyId]) => (
                        <li
                          key={story}
                          style={{
                            fontFamily: "inherit",
                            fontSize: "0.85em",
                            color: "#555",
                            padding: "1px 0",
                          }}
                        >
                          {storyId ? (
                            <a
                              href={`http://localhost:6006/?path=/story/${storyId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "inherit", textDecoration: "underline dotted" }}
                            >
                              {story}
                            </a>
                          ) : story}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

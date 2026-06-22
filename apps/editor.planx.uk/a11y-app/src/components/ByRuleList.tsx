import React from "react";
import type { Violation } from "../shared/types";
import { IMPACT_COLOUR, IMPACT_BG } from "../shared/types";
import { groupBy } from "../shared/parseViolations";

interface Props {
  violations: Violation[];
}

const IMPACTS = ["critical", "serious", "moderate", "minor"] as const;

export default function ByRuleList({ violations }: Props) {
  if (violations.length === 0) return <p>No violations.</p>;

  const byImpact = groupBy(violations, (v) => v.impact);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.5rem" }}>
      {IMPACTS.map((impact) => {
        const impactViolations = byImpact.get(impact) ?? [];
        if (impactViolations.length === 0) return null;

        const byRule = groupBy(impactViolations, (v) => v.ruleId);
        const rulesSorted = [...byRule.entries()].sort((a, b) => b[1].length - a[1].length);
        const colour = IMPACT_COLOUR[impact];
        const bg = IMPACT_BG[impact];

        return (
          <details key={impact}>
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0.75rem",
                borderLeft: `4px solid ${colour}`,
                background: bg,
                borderRadius: "0 4px 4px 0",
                cursor: "pointer",
                userSelect: "none",
                listStyle: "none",
              }}
            >
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  color: colour,
                  minWidth: "1.5ch",
                }}
              >
                {impactViolations.length}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: colour,
                }}
              >
                {impact}
              </span>
              <span style={{ marginLeft: "auto", fontSize: "0.82rem", color: "#666" }}>
                {byRule.size} rule{byRule.size !== 1 ? "s" : ""}
              </span>
            </summary>

            <div style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
              {rulesSorted.map(([ruleId, instances]) => {
                const { description } = instances[0];
                const byComp = groupBy(instances, (v) => v.component);
                const compsSorted = [...byComp.keys()].sort();

                return (
                  <details key={ruleId} style={{ marginBottom: "0.25rem" }}>
                    <summary
                      style={{
                        padding: "8px 6px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        cursor: "pointer",
                      }}
                    >
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
                        const storyMap = new Map<string, string>();
                        for (const v of compViolations) storyMap.set(v.story, v.storyId);
                        const stories = [...storyMap.entries()].sort(([a], [b]) =>
                          a.localeCompare(b),
                        );
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
                                  ) : (
                                    story
                                  )}
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
          </details>
        );
      })}
    </div>
  );
}

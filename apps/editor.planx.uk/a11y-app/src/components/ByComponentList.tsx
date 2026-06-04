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
        marginRight: 6,
      }}
    >
      {impact}
    </span>
  );
}

export default function ByComponentList({ violations }: Props) {
  const byComponent = groupBy(violations, (v) => v.component);
  const sorted = [...byComponent.entries()].sort((a, b) => {
    const aWorst = Math.min(...a[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
    const bWorst = Math.min(...b[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
    return aWorst - bWorst || b[1].length - a[1].length;
  });

  if (sorted.length === 0) return <p>No violations.</p>;

  return (
    <div>
      {sorted.map(([comp, vs]) => {
        const worstImpact = vs.reduce(
          (best, v) =>
            (IMPACT_ORDER[v.impact] ?? 9) < (IMPACT_ORDER[best] ?? 9)
              ? v.impact
              : best,
          "minor",
        );
        const colour = IMPACT_COLOUR[worstImpact];
        const byStory = groupBy(vs, (v) => v.story);
        const storiesSorted = [...byStory.entries()].sort((a, b) => {
          const aW = Math.min(...a[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
          const bW = Math.min(...b[1].map((v) => IMPACT_ORDER[v.impact] ?? 9));
          return aW - bW || b[1].length - a[1].length;
        });

        return (
          <details key={comp}>
            <summary
              style={{
                padding: "8px 8px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                borderLeft: `3px solid ${colour}`,
              }}
            >
              <strong>{comp}</strong>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.82rem",
                  color: "#666",
                  whiteSpace: "nowrap",
                }}
              >
                {vs.length} violation{vs.length !== 1 ? "s" : ""}
              </span>
            </summary>
            <div style={{ padding: "4px 12px" }}>
              {storiesSorted.map(([story, svs]) => {
                const storyId = svs[0].storyId;
                return (
                <div key={story} style={{ margin: "8px 0" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#888",
                      marginBottom: 4,
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
                  </div>
                  {[...svs]
                    .sort(
                      (a, b) =>
                        (IMPACT_ORDER[a.impact] ?? 9) -
                        (IMPACT_ORDER[b.impact] ?? 9),
                    )
                    .map((v, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "8px 0",
                          borderBottom: "1px solid #f0f0f0",
                          fontSize: "0.9em",
                        }}
                      >
                        <Badge impact={v.impact} />
                        <code>{v.ruleId}</code> — {v.description}
                        {v.nodes.length > 0 && (
                          <ul
                            style={{
                              margin: "6px 0 0 20px",
                              padding: 0,
                              listStyle: "disc",
                            }}
                          >
                            {v.nodes.map((n, j) => (
                              <li key={j} style={{ padding: "2px 0" }}>
                                <code
                                  style={{
                                    fontSize: "0.82em",
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {n}
                                </code>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}

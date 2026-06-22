import React from "react";
import type { Violation } from "../shared/types";
import { IMPACT_BG, IMPACT_COLOUR } from "../shared/types";

interface Props {
  violations: Violation[];
  compact?: boolean;
}

export default function SummaryCards({ violations, compact }: Props) {
  const counts: Record<string, number> = {};
  for (const v of violations) counts[v.impact] = (counts[v.impact] ?? 0) + 1;

  return (
    <div style={{ display: "flex", gap: compact ? "0.5rem" : "0.75rem", flexWrap: compact ? "nowrap" : "wrap", margin: compact ? "0 0 1rem" : "0.75rem 0 1rem" }}>
      {(["critical", "serious", "moderate", "minor"] as const).map((impact) => (
        <div
          key={impact}
          style={{
            flex: compact ? "0 0 auto" : "1 1 110px",
            padding: compact ? "0.3rem 0.65rem" : "0.75rem 1rem",
            borderRadius: 6,
            minWidth: compact ? 0 : 100,
            borderLeft: `4px solid ${IMPACT_COLOUR[impact]}`,
            background: IMPACT_BG[impact],
          }}
        >
          <div
            style={{
              fontSize: compact ? "1.1rem" : "2rem",
              fontWeight: 700,
              lineHeight: 1,
              color: IMPACT_COLOUR[impact],
            }}
          >
            {counts[impact] ?? 0}
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: 2,
              color: "#555",
            }}
          >
            {impact}
          </div>
        </div>
      ))}
    </div>
  );
}

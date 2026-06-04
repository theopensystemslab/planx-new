import React from "react";
import type { Violation } from "../shared/types";
import { IMPACT_BG, IMPACT_COLOUR } from "../shared/types";

interface Props {
  violations: Violation[];
}

export default function SummaryCards({ violations }: Props) {
  const counts: Record<string, number> = {};
  for (const v of violations) counts[v.impact] = (counts[v.impact] ?? 0) + 1;

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "0.75rem 0 1rem" }}>
      {(["critical", "serious", "moderate", "minor"] as const).map((impact) => (
        <div
          key={impact}
          style={{
            flex: "1 1 110px",
            padding: "0.75rem 1rem",
            borderRadius: 6,
            minWidth: 100,
            borderLeft: `4px solid ${IMPACT_COLOUR[impact]}`,
            background: IMPACT_BG[impact],
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: 1,
              color: IMPACT_COLOUR[impact],
            }}
          >
            {counts[impact] ?? 0}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: 4,
            }}
          >
            {impact}
          </div>
        </div>
      ))}
    </div>
  );
}

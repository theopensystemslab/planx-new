import React from "react";
import type { Audience, Violation } from "../shared/types";
import SummaryCards from "./SummaryCards";

interface Props {
  violations: Violation[];
  audience: Audience;
}

export default function AudiencePanel({ violations, audience }: Props) {
  const isPublic = audience === "public";
  const compCount = new Set(violations.map((v) => v.component)).size;

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: "1.25rem",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          fontSize: "1.05rem",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "2px 7px",
            borderRadius: 3,
            background: isPublic ? "#e3f2fd" : "#f3e5f5",
            color: isPublic ? "#0d47a1" : "#6a1b9a",
          }}
        >
          {isPublic ? "public-facing" : "editor-facing"}
        </span>
        {isPublic ? "form components" : "Council / admin UI"}
      </h3>
      <p style={{ fontSize: "0.85em", color: "#555", margin: "0 0 0.5rem" }}>
        <strong>{violations.length}</strong> violations &nbsp;
        <strong>{compCount}</strong> components
      </p>
      <SummaryCards violations={violations} />
    </div>
  );
}

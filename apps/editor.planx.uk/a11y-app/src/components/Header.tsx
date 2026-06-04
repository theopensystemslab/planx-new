import React from "react";
import type { VitestReport } from "../shared/types";

export type RunStatus = "idle" | "running" | "done" | "error";

interface Props {
  status: RunStatus;
  exitCode: number | null;
  onRun: () => void;
  report: VitestReport | null;
}

export default function Header({ status, exitCode, onRun, report }: Props) {
  const isRunning = status === "running";

  const chip =
    status === "running"
      ? { bg: "#e3f2fd", color: "#1565c0", text: "Running…" }
      : status === "done" && exitCode === 0
        ? { bg: "#e8f5e9", color: "#2e7d32", text: "Passed" }
        : status === "done" || status === "error"
          ? { bg: "#ffebee", color: "#c62828", text: "Violations found" }
          : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: "1.5rem",
        flexWrap: "wrap",
      }}
    >
      <h1 style={{ margin: 0, flex: 1 }}>Accessibility Audit</h1>
      {report && (
        <span style={{ fontSize: "0.85em", color: "#666" }}>
          {report.numTotalTests} stories &nbsp;·&nbsp;{" "}
          {report.numFailedTests} failing
        </span>
      )}
      {chip && (
        <span
          style={{
            background: chip.bg,
            color: chip.color,
            padding: "4px 14px",
            borderRadius: 20,
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {chip.text}
        </span>
      )}
      <button
        onClick={onRun}
        disabled={isRunning}
        style={{
          padding: "8px 18px",
          borderRadius: 6,
          border: "none",
          cursor: isRunning ? "not-allowed" : "pointer",
          background: isRunning ? "#ccc" : "#1565c0",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
      >
        {isRunning ? "Running…" : "Run tests"}
      </button>
    </div>
  );
}

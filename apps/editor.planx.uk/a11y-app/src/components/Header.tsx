import React from "react";
import type { VitestReport } from "../shared/types";

export type RunStatus = "idle" | "running" | "done" | "error";

interface Props {
  status: RunStatus;
  exitCode: number | null;
  onRun: () => void;
  report: VitestReport | null;
  meta: { branch: string; commit: string } | null;
}

const REPO = "https://github.com/theopensystemslab/planx-new";

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return "1 hour ago";
  return `${hrs} hours ago`;
}

export default function Header({ status, exitCode, onRun, report, meta }: Props) {
  const isRunning = status === "running";

  const chip =
    status === "running"
      ? { bg: "#e3f2fd", color: "#1565c0", text: "Running…" }
      : status === "done" && exitCode === 0
        ? { bg: "#e8f5e9", color: "#2e7d32", text: "Passed" }
        : status === "done" || status === "error"
          ? { bg: "#ffebee", color: "#c62828", text: "Violations found" }
          : null;

  const linkStyle: React.CSSProperties = {
    color: "inherit",
    textDecoration: "underline dotted",
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, flex: 1 }}>Accessibility Audit</h1>
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
      {(report || meta) && (
        <p style={{ margin: "6px 0 0", fontSize: "0.8em", color: "#888" }}>
          {report && <>Last ran: {formatRelativeTime(report.startTime)}</>}
          {report && meta && <>&nbsp;·&nbsp;</>}
          {meta && (
            <>
              on branch{" "}
              <a
                href={`${REPO}/tree/${meta.branch}`}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                <code style={{ fontSize: "0.95em" }}>{meta.branch}</code>
              </a>
              {" "}
              <a
                href={`${REPO}/commit/${meta.commit}`}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                <code style={{ fontSize: "0.95em" }}>{meta.commit}</code>
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

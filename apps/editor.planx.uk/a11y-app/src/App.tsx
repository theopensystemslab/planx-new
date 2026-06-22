import React, { useCallback, useEffect, useRef, useState } from "react";
import type { VitestReport, Violation } from "./shared/types";
import { parseViolations } from "./shared/parseViolations";
import Header, { type RunStatus } from "./components/Header";
import StreamLog from "./components/StreamLog";
import ByRuleList from "./components/ByRuleList";
import ByComponentList from "./components/ByComponentList";

interface StatBadge {
  label: string;
  value: number;
  color?: string;
}

function StatBadges({ badges }: { badges: StatBadge[] }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1rem 0 1.5rem" }}>
      {badges.map(({ label, value, color }) => (
        <span
          key={label}
          style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: "0.3rem",
            padding: "4px 12px",
            borderRadius: 20,
            background: "#f0f0f0",
            fontSize: "0.85rem",
            color: "#333",
          }}
        >
          <strong style={{ color: color ?? "#111" }}>{value}</strong>
          <span style={{ color: "#666" }}>{label}</span>
        </span>
      ))}
    </div>
  );
}

const sectionLabelStyle = (isPublic: boolean): React.CSSProperties => ({
  display: "inline-block",
  fontSize: "0.8rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  padding: "2px 7px",
  borderRadius: 3,
  background: isPublic ? "#e3f2fd" : "#f3e5f5",
  color: isPublic ? "#0d47a1" : "#6a1b9a",
  verticalAlign: "middle",
  marginRight: 8,
});

export default function App() {
  const [report, setReport] = useState<VitestReport | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [streamLines, setStreamLines] = useState<string[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ branch: string; commit: string } | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch("/api/meta")
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => null);
  }, []);

  const loadResults = useCallback(async () => {
    try {
      const res = await fetch("/api/results");
      if (!res.ok) {
        setLoadError('No results yet — click "Run tests" to generate a report.');
        return;
      }
      const data: VitestReport = await res.json();
      setReport(data);
      setViolations(parseViolations(data));
      setLoadError(null);
    } catch {
      setLoadError("Failed to load results.");
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    return () => esRef.current?.close();
  }, []);

  const handleRun = useCallback(async () => {
    if (status === "running") return;

    const res = await fetch("/api/run", { method: "POST" });
    const json = await res.json();

    if (json.error) {
      console.error("Run failed:", json.error);
      return;
    }

    setStatus("running");
    setStreamLines([]);

    const es = new EventSource("/api/stream");
    esRef.current = es;

    es.onmessage = (e) => {
      const line: string = JSON.parse(e.data as string);

      if (line.startsWith("__done__:")) {
        const code = parseInt(line.split(":")[1], 10);
        es.close();
        esRef.current = null;
        setExitCode(code);
        setStatus(code === 0 ? "done" : "error");
        loadResults();
        return;
      }

      setStreamLines((prev) => [...prev, line]);
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setStatus("error");
    };
  }, [status, loadResults]);

  const publicViolations = violations.filter((v) => v.audience === "public");
  const editorViolations = violations.filter((v) => v.audience === "editor");
  const uniqueRules = new Set(violations.map((v) => v.ruleId)).size;
  const uniqueComponents = new Set(violations.map((v) => v.component)).size;

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "2rem auto",
        padding: "0 1.5rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1a1a1a",
        lineHeight: 1.5,
      }}
    >
      <Header
        status={status}
        exitCode={exitCode}
        onRun={handleRun}
        report={report}
        meta={meta}
      />

      <StreamLog lines={streamLines} visible={status === "running"} />

      {loadError && <p style={{ color: "#666" }}>{loadError}</p>}

      {report && (
        <>
          <StatBadges
            badges={[
              { label: "stories", value: report.numTotalTests },
              { label: "passing", value: report.numPassedTests, color: "#2e7d32" },
              { label: "failing", value: report.numFailedTests, color: report.numFailedTests > 0 ? "#c62828" : undefined },
              { label: "violation rules", value: uniqueRules, color: uniqueRules > 0 ? "#b71c1c" : undefined },
              { label: "components affected", value: uniqueComponents },
              { label: "total violations", value: violations.length, color: violations.length > 0 ? "#b71c1c" : undefined },
            ]}
          />

          <h2>
            <span style={sectionLabelStyle(true)}>public-facing</span>
            form violations
          </h2>
          <ByRuleList violations={publicViolations} />

          <h3>By component</h3>
          <p style={{ color: "#666", fontSize: "0.9em", marginTop: 0 }}>
            Expand a component to see each story and the specific elements affected.
          </p>
          <ByComponentList violations={publicViolations} />

          <h2>
            <span style={sectionLabelStyle(false)}>editor-facing</span>
            Council / admin UI violations
          </h2>
          <ByRuleList violations={editorViolations} />

          <h3>By component</h3>
          <p style={{ color: "#666", fontSize: "0.9em", marginTop: 0 }}>
            Expand a component to see each story and the specific elements affected.
          </p>
          <ByComponentList violations={editorViolations} />
        </>
      )}
    </div>
  );
}

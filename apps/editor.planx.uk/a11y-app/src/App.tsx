import React, { useCallback, useEffect, useRef, useState } from "react";
import type { VitestReport, Violation } from "./shared/types";
import { parseViolations } from "./shared/parseViolations";
import Header, { type RunStatus } from "./components/Header";
import StreamLog from "./components/StreamLog";
import SummaryCards from "./components/SummaryCards";
import AudiencePanel from "./components/AudiencePanel";
import ByRuleList from "./components/ByRuleList";
import ByComponentList from "./components/ByComponentList";

const thStyle: React.CSSProperties = {
  border: "1px solid #e0e0e0",
  padding: "8px 14px",
  background: "#f5f5f5",
  textAlign: "left",
};
const tdStyle: React.CSSProperties = {
  border: "1px solid #e0e0e0",
  padding: "8px 14px",
};

export default function App() {
  const [report, setReport] = useState<VitestReport | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [streamLines, setStreamLines] = useState<string[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const loadResults = useCallback(async () => {
    try {
      const res = await fetch("/api/results");
      if (!res.ok) {
        setLoadError(
          'No results yet — click "Run tests" to generate a report.',
        );
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

  // Clean up EventSource on unmount
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
      />

      <StreamLog lines={streamLines} visible={status === "running"} />

      {loadError && <p style={{ color: "#666" }}>{loadError}</p>}

      {report && (
        <>
          <h2 style={{ marginTop: "2rem" }}>Summary by audience</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginTop: "1rem",
            }}
          >
            <AudiencePanel violations={publicViolations} audience="public" />
            <AudiencePanel violations={editorViolations} audience="editor" />
          </div>

          <table style={{ borderCollapse: "collapse", marginTop: "1.5rem" }}>
            <tbody>
              <tr>
                <th style={thStyle}>Total stories tested</th>
                <td style={tdStyle}>{report.numTotalTests}</td>
              </tr>
              <tr>
                <th style={thStyle}>Passing</th>
                <td style={tdStyle}>{report.numPassedTests}</td>
              </tr>
              <tr>
                <th style={thStyle}>Failing</th>
                <td style={tdStyle}>{report.numFailedTests}</td>
              </tr>
              <tr>
                <th style={thStyle}>Distinct violation rules</th>
                <td style={tdStyle}>{uniqueRules}</td>
              </tr>
              <tr>
                <th style={thStyle}>Components affected</th>
                <td style={tdStyle}>{uniqueComponents}</td>
              </tr>
              <tr>
                <th style={thStyle}>Total violation instances</th>
                <td style={tdStyle}>{violations.length}</td>
              </tr>
            </tbody>
          </table>

          <h2>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 7px",
                borderRadius: 3,
                background: "#e3f2fd",
                color: "#0d47a1",
                verticalAlign: "middle",
                marginRight: 8,
              }}
            >
              public-facing
            </span>
            form violations
          </h2>
          <h3>By rule</h3>
          <ByRuleList violations={publicViolations} />

          <h3>By component</h3>
          <p style={{ color: "#666", fontSize: "0.9em", marginTop: 0 }}>
            Expand a component to see each story and the specific elements
            affected.
          </p>
          <ByComponentList violations={publicViolations} />

          <h2>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "2px 7px",
                borderRadius: 3,
                background: "#f3e5f5",
                color: "#6a1b9a",
                verticalAlign: "middle",
                marginRight: 8,
              }}
            >
              editor-facing
            </span>
            Council / admin UI violations
          </h2>
          <p style={{ color: "#555", marginTop: 0 }}>
            Components used by council officers and flow editors.
          </p>

          <h3>By rule</h3>
          <ByRuleList violations={editorViolations} />

          <h3>By component</h3>
          <p style={{ color: "#666", fontSize: "0.9em", marginTop: 0 }}>
            Expand a component to see each story and the specific elements
            affected.
          </p>
          <ByComponentList violations={editorViolations} />
        </>
      )}
    </div>
  );
}

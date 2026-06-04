import React, { useEffect, useRef } from "react";

interface Props {
  lines: string[];
  visible: boolean;
}

export default function StreamLog({ lines, visible }: Props) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [lines]);

  if (!visible && lines.length === 0) return null;

  return (
    <pre
      ref={ref}
      style={{
        background: "#1a1a1a",
        color: "#4ade80",
        fontFamily: "monospace",
        fontSize: "0.8rem",
        padding: "1rem",
        borderRadius: 6,
        height: 280,
        overflow: "auto",
        margin: "1rem 0",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {lines.join("")}
      {visible && <span style={{ opacity: 0.5 }}>▋</span>}
    </pre>
  );
}

import React, { useContext, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import type { Store } from "../FlowEditor/lib/store";
import { useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node from "./Node";

interface Props {
  isSidebar?: Boolean;
}

const Questions = (props: Props) => {
  const [
    currentCard,
    previousCard,
    record,
    breadcrumbs,
    passport,
    sessionId,
    id,
    resumeSession,
  ] = useStore((state) => [
    state.currentCard,
    state.previousCard(),
    state.record,
    state.breadcrumbs,
    state.passport,
    state.sessionId,
    state.id,
    state.resumeSession,
  ]);

  const node = currentCard();
  const flow = useContext(PreviewContext);

  useEffect(() => {
    if (!props.isSidebar) {
      const entry = `flow:${id}`;
      try {
        const state = JSON.parse(localStorage.getItem(entry) || "");
        if (
          state &&
          window.confirm("Would you like to resume the last session?")
        ) {
          resumeSession(state);
        }
      } catch (err) {
        // Clean up just in case
        localStorage.removeItem(entry);
      }
    }
  }, []);

  useEffect(() => {
    if (!props.isSidebar && id) {
      localStorage.setItem(
        `flow:${id}`,
        JSON.stringify({
          breadcrumbs,
          passport,
          sessionId,
          id,
        })
      );
    }
  }, [breadcrumbs, passport, sessionId, id]);

  return (
    <>
      <span
        onClick={() => {
          record(previousCard!);
        }}
        style={{
          padding: "0 10px 10px",
          visibility: previousCard ? "visible" : "hidden",
          pointerEvents: previousCard ? "auto" : "none",
          display: "block",
          cursor: "pointer",
          userSelect: "none",
          alignSelf: "start",
        }}
      >
        ⭠ Back
      </span>

      {node && (
        <ErrorBoundary
          FallbackComponent={({ error }) => <pre>{error.stack}</pre>}
        >
          <Node
            node={node}
            key={node.id}
            handleSubmit={(values: Store.componentOutput) => {
              record(node.id!, values);
            }}
            settings={flow?.settings}
          />
        </ErrorBoundary>
      )}
    </>
  );
};

export default Questions;

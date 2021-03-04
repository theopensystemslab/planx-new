import React, { useContext, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import {
  componentOutput,
  useStore,
} from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node from "./Node";

const Questions = () => {
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
    try {
      const state = JSON.parse(localStorage.getItem(`flow:${id}`) || "");
      if (
        state &&
        window.confirm("Would you like to resume the last session?")
      ) {
        resumeSession(state);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (id) {
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
        onClick={() => record(previousCard)}
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
            handleSubmit={(values: componentOutput) => {
              record(node.id, values);
            }}
            settings={flow?.settings}
          />
        </ErrorBoundary>
      )}
    </>
  );
};

export default Questions;

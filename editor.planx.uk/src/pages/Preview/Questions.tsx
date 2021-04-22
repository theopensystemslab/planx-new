import React, { useContext, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node, { handleSubmit } from "./Node";

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
    govUkPayment,
  ] = useStore((state) => [
    state.currentCard,
    state.previousCard(),
    state.record,
    state.breadcrumbs,
    state.computePassport(),
    state.sessionId,
    state.id,
    state.resumeSession,
    state.govUkPayment,
  ]);

  const node = currentCard();
  const flow = useContext(PreviewContext);

  const hasPaid = Boolean(passport.data?.payment);

  useEffect(() => {
    if (!props.isSidebar) {
      const entry = `flow:${id}`;
      try {
        const state = JSON.parse(localStorage.getItem(entry) || "");
        if (state) {
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
          id,
          passport,
          sessionId,
          govUkPayment,
        })
      );
    }
  }, [breadcrumbs, passport, sessionId, id, govUkPayment]);

  const handleSubmit = (id: string): handleSubmit => (answers = [], data?) => {
    record(id, { answers, data });
  };

  return (
    <>
      <span
        onClick={() => {
          record(previousCard!);
        }}
        style={{
          padding: "0 10px 10px",
          visibility: previousCard && !hasPaid ? "visible" : "hidden",
          pointerEvents: previousCard && !hasPaid ? "auto" : "none",
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
            handleSubmit={handleSubmit(node.id!)}
            settings={flow?.settings}
          />
        </ErrorBoundary>
      )}
    </>
  );
};

export default Questions;

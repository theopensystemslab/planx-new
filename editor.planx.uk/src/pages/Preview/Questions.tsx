import React, { useContext, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "../../components/ErrorFallback";
import type { Store } from "../FlowEditor/lib/store";
import { useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node, { handleSubmit } from "./Node";

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
    govUkPayment,
    previewEnvironment,
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
    state.previewEnvironment,
  ]);

  const node = currentCard();
  const flow = useContext(PreviewContext);

  const hasPaid = Boolean(passport.data?.payment);
  const isStandalone = previewEnvironment === "standalone";

  useEffect(() => {
    if (isStandalone) {
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
    if (isStandalone && id) {
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

  const handleSubmit = (id: string): handleSubmit => (userData) => {
    const { answers = [], data } = (() => {
      try {
        const { answers = [], data } = userData as any;
        return { answers: answers.filter(Boolean), data };
      } catch (err) {
        return {};
      }
    })();

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
        <ErrorBoundary FallbackComponent={ErrorFallback}>
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

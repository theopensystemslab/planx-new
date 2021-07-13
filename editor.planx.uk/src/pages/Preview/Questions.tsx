import { getLocalFlow, setLocalFlow } from "lib/local";
import React, { useContext, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "../../components/ErrorFallback";
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
    canGoBack,
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
    state.canGoBack,
  ]);

  const node = currentCard();
  const flow = useContext(PreviewContext);

  const showBackButton = node?.id ? canGoBack(node.id) : false;
  const isStandalone = previewEnvironment === "standalone";

  useEffect(() => {
    if (isStandalone) {
      const state = getLocalFlow(id);
      if (state) {
        resumeSession(state);
      }
    }
  }, []);

  useEffect(() => {
    if (isStandalone && id) {
      setLocalFlow(id, {
        breadcrumbs,
        id,
        passport,
        sessionId,
        govUkPayment,
      });
    }
  }, [breadcrumbs, passport, sessionId, id, govUkPayment]);

  const handleSubmit = (id: string): handleSubmit => (userData) => {
    const { data, answers = [], auto = false } = (() => {
      try {
        const { answers = [], data, auto } = userData as any;
        return { answers: answers.filter(Boolean), data, auto };
      } catch (err) {
        return {};
      }
    })();

    record(id, { answers, data, auto });
  };

  return (
    <>
      <span
        onClick={() => {
          record(previousCard!);
        }}
        style={{
          padding: "0 10px 10px",
          visibility: showBackButton ? "visible" : "hidden",
          pointerEvents: showBackButton ? "auto" : "none",
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

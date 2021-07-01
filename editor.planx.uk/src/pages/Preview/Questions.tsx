import { GOV_PAY_PASSPORT_KEY } from "@planx/components/Pay/model";
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
  const flow = useContext(PreviewContext)?.flow;

  const hasPaid = Boolean(passport.data?.[GOV_PAY_PASSPORT_KEY]);
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

import { Notifier } from "@airbrake/browser";
import React, { useContext, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "../../components/ErrorFallback";
import type { Store } from "../FlowEditor/lib/store";
import { useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node from "./Node";

const AirbrakeErrorNotifier = (error: Error, info: {componentStack: string}): any => {
  // Callback function to send JS error info to Airbrake when an ErrorBoundary is triggered
  const airbrake = new Notifier({
    projectId: 331493,
    projectKey: "c6331cc0bfc7a373c8eddf221516b489",
  });

  console.log(error, info, info.componentStack);

  return airbrake.notify({
      error: error,
      context: { component: 'sample' },
      environment: { env1: 'value' },
      params: { param1: 'value' },
      session: { session1: 'value' },
  });
}

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
    previewEnvironment,
  ] = useStore((state) => [
    state.currentCard,
    state.previousCard(),
    state.record,
    state.breadcrumbs,
    state.passport,
    state.sessionId,
    state.id,
    state.resumeSession,
    state.previewEnvironment,
  ]);

  const node = currentCard();
  const flow = useContext(PreviewContext);

  const hasPaid = Boolean(passport.data["payment"]);
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
          FallbackComponent={ErrorFallback}
          onError={AirbrakeErrorNotifier}
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

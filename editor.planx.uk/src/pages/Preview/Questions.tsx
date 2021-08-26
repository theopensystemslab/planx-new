import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import { getLocalFlow, setLocalFlow } from "lib/local";
import React, { useContext, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

import ErrorFallback from "../../components/ErrorFallback";
import { useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node, { handleSubmit } from "./Node";

const useClasses = makeStyles((theme) => ({
  backButton: {
    padding: "0 10px 10px",
    visibility: "visible",
    pointerEvents: "auto",
    display: "block",
    cursor: "pointer",
    userSelect: "none",
    alignSelf: "start",
    fontSize: 16,
    background: "transparent",
    border: "none",

    "&:hover": {
      textDecoration: "underline",
    },
  },
  hidden: {
    visibility: "hidden",
    pointerEvents: "none",
  },
}));

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
  const flow = useContext(PreviewContext)?.flow;

  const classes = useClasses();

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
    <Box width="100%" role="main">
      <button
        className={classnames(classes.backButton, {
          [classes.hidden]: !showBackButton,
        })}
        onClick={() => {
          record(previousCard!);
        }}
      >
        ⭠ Back
      </button>

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
    </Box>
  );
};

export default Questions;

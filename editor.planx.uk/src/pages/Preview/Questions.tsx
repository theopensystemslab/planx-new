import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { getLocalFlow, setLocalFlow } from "lib/local";
import * as NEW from "lib/local.new";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ApplicationPath, Session } from "types";

import ErrorFallback from "../../components/Error/ErrorFallback";
import { useStore } from "../FlowEditor/lib/store";
import Node, { HandleSubmit } from "./Node";

const BackBar = styled(Box)(() => ({
  top: 0,
  left: 0,
  width: "100%",
  zIndex: "1000",
}));

export const BackButton = styled(Button)(({ theme, hidden }) => ({
  visibility: "visible",
  pointerEvents: "auto",
  userSelect: "none",
  alignSelf: "start",
  padding: theme.spacing(1, 1, 1, 0),
  ...(hidden && {
    visibility: "hidden",
    pointerEvents: "none",
  }),
}));

interface QuestionsProps {
  previewEnvironment: PreviewEnvironment;
}

const Questions = ({ previewEnvironment }: QuestionsProps) => {
  const [
    previousCard,
    record,
    breadcrumbs,
    passport,
    sessionId,
    id,
    resumeSession,
    govUkPayment,
    canGoBack,
    setPreviewEnvironment,
    getType,
    node,
    setCurrentCard,
  ] = useStore((state) => [
    state.previousCard,
    state.record,
    state.breadcrumbs,
    state.computePassport(),
    state.sessionId,
    state.id,
    state.resumeSession,
    state.govUkPayment,
    state.canGoBack,
    state.setPreviewEnvironment,
    state.getType,
    state.currentCard,
    state.setCurrentCard,
  ]);
  const isStandalone = previewEnvironment === "standalone";
  const { createAnalytics, trackEvent } = useAnalyticsTracking();
  const [gotFlow, setGotFlow] = useState(false);
  const isUsingLocalStorage =
    useStore((state) => state.path) === ApplicationPath.SingleSession;

  useEffect(
    () => setPreviewEnvironment(previewEnvironment),
    [previewEnvironment, setPreviewEnvironment],
  );

  // Initial setup
  useEffect(() => {
    setCurrentCard();

    if (!isStandalone) return;

    if (isUsingLocalStorage) {
      const state = getLocalFlow(id);
      if (state) resumeSession(state);
      createAnalytics(state ? "resume" : "init");
      setGotFlow(true);
    } else {
      NEW.getLocalFlow(sessionId).then((state) => {
        // session data is resumed by ./ResumePage.tsx
        createAnalytics(state ? "resume" : "init");
        setGotFlow(true);
      });
    }
  }, []);

  // Update session when a question is answered
  useEffect(() => {
    if (!gotFlow || !isStandalone || !id) return;

    const session: Session = {
      breadcrumbs,
      id,
      passport,
      sessionId,
      govUkPayment,
    };

    isUsingLocalStorage
      ? setLocalFlow(id, session)
      : NEW.setLocalFlow(sessionId, session);
  }, [gotFlow, breadcrumbs, passport, sessionId, id, govUkPayment]);

  // scroll to top on any update to breadcrumbs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [breadcrumbs]);

  const handleSubmit =
    (id: string): HandleSubmit =>
    (userData) => {
      const {
        data = undefined,
        answers = [],
        auto = false,
      } = (() => {
        try {
          const { answers = [], data, auto } = userData as any;
          return { answers: answers.filter(Boolean), data, auto };
        } catch (err) {
          return {};
        }
      })();

      record(id, { answers, data, auto });
    };

  const goBack = useCallback(() => {
    const previous = previousCard(node);
    if (previous) {
      trackEvent({
        event: "backwardsNavigation",
        metadata: null,
        initiator: "back",
        nodeId: previous,
      });
      record(previous);
    }
  }, [node?.id]);

  const showBackButton = useMemo(
    () => (node?.id ? canGoBack(node) : false),
    [node?.id],
  );

  const showBackBar = useMemo(
    () => getType(node) !== TYPES.Confirmation,
    [node, getType],
  );

  return (
    <Box width="100%">
      <BackBar hidden={!showBackBar}>
        <Container maxWidth={false}>
          <BackButton
            variant="link"
            hidden={!showBackButton}
            data-testid="backButton"
            onClick={() => goBack()}
          >
            <ArrowBackIcon fontSize="small" />
            Back
          </BackButton>
        </Container>
      </BackBar>

      {node && (
        <Box component="main" id="main-content" sx={{ width: "100%" }}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Node
              node={node}
              key={node.id}
              handleSubmit={handleSubmit(node.id!)}
            />
          </ErrorBoundary>
        </Box>
      )}
    </Box>
  );
};

export default Questions;

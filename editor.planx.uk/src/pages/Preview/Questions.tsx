import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { getLocalFlow, setLocalFlow } from "lib/local";
import * as NEW from "lib/local.new";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ApplicationPath, Session } from "types";

import ErrorFallback from "../../components/ErrorFallback";
import { useStore } from "../FlowEditor/lib/store";
import Node, { handleSubmit } from "./Node";

const BackBar = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  left: 0,
  width: "100%",
  background: theme.palette.background.paper,
  zIndex: "1000",
  borderBottom: `1px solid ${theme.palette.border.light}`,
}));

const BackButton = styled(ButtonBase)(({ theme, hidden }) => ({
  visibility: "visible",
  pointerEvents: "auto",
  display: "flex",
  cursor: "pointer",
  userSelect: "none",
  alignSelf: "start",
  fontSize: "inherit",
  background: "transparent",
  border: "none",
  columnGap: theme.spacing(1),
  padding: theme.spacing(1, 1, 1, 0),
  textDecoration: "underline",
  "&:hover": {
    textDecorationThickness: "3px",
  },
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
  ]);
  const isStandalone = previewEnvironment === "standalone";
  const { createAnalytics, node } = useAnalyticsTracking();
  const [gotFlow, setGotFlow] = useState(false);
  const isUsingLocalStorage =
    useStore((state) => state.path) === ApplicationPath.SingleSession;

  useEffect(
    () => setPreviewEnvironment(previewEnvironment),
    [previewEnvironment, setPreviewEnvironment],
  );

  // Initial setup
  useEffect(() => {
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
    (id: string): handleSubmit =>
    (userData) => {
      const {
        data = undefined,
        answers = [],
        auto = false,
        feedback = undefined,
      } = (() => {
        try {
          const { answers = [], data, auto, feedback } = userData as any;
          return { answers: answers.filter(Boolean), data, auto, feedback };
        } catch (err) {
          return {};
        }
      })();

      record(id, { answers, data, auto, feedback });
    };

  const goBack = useCallback(() => {
    const previous = previousCard(node);
    if (previous) record(previous);
  }, [node?.id]);

  const showBackButton = useMemo(
    () => (node?.id ? canGoBack(node) : false),
    [node?.id],
  );

  return (
    <Box width="100%" role="main">
      <BackBar>
        <Container maxWidth="contentWrap">
          <BackButton hidden={!showBackButton} onClick={() => goBack()}>
            <ArrowBackIcon fontSize="small" />
            Back
          </BackButton>
        </Container>
      </BackBar>

      {node && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Node
            node={node}
            key={node.id}
            handleSubmit={handleSubmit(node.id!)}
          />
        </ErrorBoundary>
      )}
    </Box>
  );
};

export default Questions;

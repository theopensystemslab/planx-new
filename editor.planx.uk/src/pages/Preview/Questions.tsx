import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import classnames from "classnames";
import {
  FEATURE_FLAG__CAN_SAVE_AND_RETURN,
  getFeatureFlags,
} from "lib/featureFlags";
import { getLocalFlow, setLocalFlow } from "lib/local";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FlowSettings } from "types";

import ErrorFallback from "../../components/ErrorFallback";
import { useStore } from "../FlowEditor/lib/store";
import { PreviewContext } from "./Context";
import Node, { handleSubmit } from "./Node";

const useClasses = makeStyles((theme) => ({
  backButton: {
    marginLeft: "10px",
    marginBottom: "10px",
    visibility: "visible",
    pointerEvents: "auto",
    display: "flex",
    cursor: "pointer",
    userSelect: "none",
    alignSelf: "start",
    fontSize: 16,
    background: "transparent",
    border: "none",
    columnGap: theme.spacing(1),
    "&:hover": {
      textDecoration: "underline",
    },
  },
  hidden: {
    visibility: "hidden",
    pointerEvents: "none",
  },
}));

interface QuestionsProps {
  previewEnvironment: PreviewEnvironment;
  settings?: FlowSettings;
}

const Questions = ({ previewEnvironment, settings }: QuestionsProps) => {
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
  const flow = useContext(PreviewContext)?.flow;
  const { createAnalytics, node } = useAnalyticsTracking();
  const classes = useClasses();
  const [gotFlow, setGotFlow] = useState(false);

  useEffect(() => {
    const featureFlags = getFeatureFlags();
    if (featureFlags.size > 0) {
      console.log(
        `🎏 FEATURE FLAGS ENABLED: ${[...featureFlags].sort().join(", ")}`
      );
    }

    setPreviewEnvironment(previewEnvironment);
    if (isStandalone) {
      if (FEATURE_FLAG__CAN_SAVE_AND_RETURN) {
        // @ts-ignore
        getLocalFlow(id).then((state) => {
          if (state) {
            resumeSession(state);
          }
          createAnalytics(state ? "resume" : "init");
          setGotFlow(true);
        });
      } else {
        const state = getLocalFlow(id);
        if (state) {
          resumeSession(state);
        }
        createAnalytics(state ? "resume" : "init");
        setGotFlow(true);
      }
    }
  }, []);

  if (FEATURE_FLAG__CAN_SAVE_AND_RETURN) {
    useEffect(() => {
      if (!gotFlow || !isStandalone || !id) return;
      setLocalFlow(id, {
        breadcrumbs,
        govUkPayment,
        id,
        passport,
        sessionId,
      });
    }, [breadcrumbs, gotFlow, govUkPayment, id, passport, sessionId]);
  } else {
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
  }

  const handleSubmit =
    (id: string): handleSubmit =>
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
    if (previous) record(previous);
  }, [node?.id]);

  const showBackButton = useMemo(
    () => (node?.id ? canGoBack(node) : false),
    [node?.id]
  );

  return (
    <Box width="100%" role="main">
      <ButtonBase
        className={classnames(classes.backButton, {
          [classes.hidden]: !showBackButton,
        })}
        onClick={() => goBack()}
      >
        <ArrowBackIcon fontSize="small"></ArrowBackIcon>
        Back
      </ButtonBase>

      {node && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Node
            node={node}
            key={node.id}
            handleSubmit={handleSubmit(node.id!)}
            settings={
              previewEnvironment === "editor" ? settings : flow?.settings
            }
          />
        </ErrorBoundary>
      )}
    </Box>
  );
};

export default Questions;

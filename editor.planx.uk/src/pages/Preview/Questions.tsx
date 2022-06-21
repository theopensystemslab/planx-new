import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import classnames from "classnames";
import { hasFeatureFlag } from "lib/featureFlags";
import { getLocalFlow, setLocalFlow } from "lib/local";
import * as NEW from "lib/local.new";
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

  if (hasFeatureFlag("SAVE_AND_RETURN")) {
    useEffect(() => {
      setPreviewEnvironment(previewEnvironment);
      if (isStandalone) {
        NEW.getLocalFlow(sessionId).then((state) => {
          if (state) {
            resumeSession(state);
          }
          createAnalytics(state ? "resume" : "init");
          setGotFlow(true);
        });
      }
    }, []);

    useEffect(() => {
      if (gotFlow && isStandalone && sessionId) {
        NEW.setLocalFlow(sessionId, {
          breadcrumbs,
          // todo: replace `id` with `flow: { id, published_flow_id }`
          id,
          passport,
          sessionId,
          govUkPayment,
        });
      }
    }, [gotFlow, breadcrumbs, passport, sessionId, id, govUkPayment]);
  } else {
    useEffect(() => {
      setPreviewEnvironment(previewEnvironment);
      if (isStandalone) {
        const state = getLocalFlow(id);
        if (state) {
          resumeSession(state);
        }
        createAnalytics(state ? "resume" : "init");
        setGotFlow(true);
      }
    }, []);

    useEffect(() => {
      if (gotFlow && isStandalone && id) {
        setLocalFlow(id, {
          breadcrumbs,
          id,
          passport,
          sessionId,
          govUkPayment,
        });
      }
    }, [gotFlow, breadcrumbs, passport, sessionId, id, govUkPayment]);
  }

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

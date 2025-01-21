import { DocumentNode } from "@apollo/client";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { PASSPORT_FEEDBACK_KEY } from "@planx/components/Feedback/Public/Public";
import Bowser from "bowser";
import { publicClient } from "lib/graphql";
import React, { createContext, useContext, useEffect } from "react";
import { usePrevious } from "react-use";

import { Store, useStore } from "../store";
import {
  INSERT_NEW_ANALYTICS,
  INSERT_NEW_ANALYTICS_LOG,
  TRACK_INPUT_ERRORS,
  UPDATE_ALLOW_LIST_ANSWERS,
  UPDATE_ANALYTICS_LOG_METADATA,
  UPDATE_FLOW_DIRECTION,
  UPDATE_HAS_CLICKED_HELP,
  UPDATE_HAS_CLICKED_SAVE,
  UPDATE_NEXT_LOG_CREATED_AT,
} from "./mutations";
import {
  AnalyticsLogDirection,
  AnalyticsType,
  EventData,
  Metadata,
  NodeMetadata,
} from "./types";
import {
  determineLogDirection,
  extractNodeTitle,
  findUpdatedBreadcrumbKeys,
  generateBackwardsNavigationMetadata,
  getAllowListAnswers,
  getNodeMetadata,
} from "./utils";

/**
 * ALLOW_LIST should stay in sync with
 *   api.planx.uk/modules/webhooks/service/analyzeSessions/operations.ts
 *
 * If appending values to ALLOW_LIST please also update the
 *  `analytics_summary` & `submission_services_summary` views to extract the value into its own column
 *
 * Please also ensure your migration ends with `GRANT SELECT ON public.{VIEW_NAME} TO metabase_read_only`
 *  so that Metabase picks up the new columns
 */
export const ALLOW_LIST = [
  "applicant.researchOptIn",
  "application.declaration.connection",
  "application.information.harmful",
  "application.information.sensitive",
  "application.type",
  "drawBoundary.action",
  PASSPORT_FEEDBACK_KEY,
  "findProperty.action",
  "_overrides",
  "planningConstraints.action",
  "property.constraints.planning",
  "property.type",
  "propertyInformation.action",
  "proposal.projectType",
  "rab.exitReason",
  "service.type",
  "usedFOIYNPP",
  "user.role",
] as const;

let lastVisibleNodeAnalyticsLogId: number | undefined = undefined;

const analyticsContext = createContext<{
  createAnalytics: (type: AnalyticsType) => Promise<void>;
  trackEvent: (eventData: EventData) => Promise<void>;
  track: (
    nodeId: string,
    direction?: AnalyticsLogDirection,
    analyticsSessionId?: number,
  ) => Promise<void>;
}>({
  createAnalytics: () => Promise.resolve(),
  trackEvent: () => Promise.resolve(),
  track: () => Promise.resolve(),
});
const { Provider } = analyticsContext;

// Navigator has to be bound to ensure it does not error in some browsers
const send = navigator?.sendBeacon?.bind(navigator);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [
    currentCard,
    breadcrumbs,
    analyticsId,
    setAnalyticsId,
    resultData,
    previewEnvironment,
    flowId,
    flow,
  ] = useStore((state) => [
    state.currentCard,
    state.breadcrumbs,
    state.analyticsId,
    state.setAnalyticsId,
    state.resultData,
    state.previewEnvironment,
    state.id,
    state.flow,
  ]);
  const isAnalyticsEnabled =
    new URL(window.location.href).searchParams.get("analytics") !== "false";
  const shouldTrackAnalytics =
    previewEnvironment === "standalone" && isAnalyticsEnabled;
  const previousBreadcrumbs = usePrevious(breadcrumbs);

  const trackVisibilityChange = () => {
    if (shouldSkipTracking()) return;

    switch (document.visibilityState) {
      case "hidden":
        send(
          `${
            import.meta.env.VITE_APP_API_URL
          }/analytics/log-user-exit?analyticsLogId=${lastVisibleNodeAnalyticsLogId?.toString()}`,
        );
        break;
      case "visible":
        send(
          `${
            import.meta.env.VITE_APP_API_URL
          }/analytics/log-user-resume?analyticsLogId=${lastVisibleNodeAnalyticsLogId?.toString()}`,
        );
        break;
    }
  };

  const onVisibilityChange = () => {
    if (shouldTrackAnalytics)
      document.addEventListener("visibilitychange", trackVisibilityChange);
    return () => {
      if (shouldTrackAnalytics)
        document.removeEventListener("visibilitychange", trackVisibilityChange);
    };
  };

  useEffect(onVisibilityChange, []);

  useEffect(() => {
    if (!shouldTrackAnalytics || !analyticsId) return;
    trackBreadcrumbChanges();
  }, [breadcrumbs]);

  return (
    <Provider
      value={{
        createAnalytics,
        trackEvent,
        track,
      }}
    >
      {children}
    </Provider>
  );

  async function track(
    nodeId: string,
    direction?: AnalyticsLogDirection,
    analyticsSessionId?: number,
  ) {
    const nodeToTrack = flow[nodeId];

    const logDirection =
      direction || determineLogDirection(breadcrumbs, previousBreadcrumbs);
    const analyticsSession = analyticsSessionId || analyticsId;

    if (!nodeToTrack || !logDirection || !analyticsSession) {
      return;
    }

    const metadata: NodeMetadata = getNodeMetadata(
      nodeToTrack,
      resultData,
      nodeId,
      breadcrumbs,
    );
    const nodeType = nodeToTrack?.type ? TYPES[nodeToTrack.type] : null;
    const nodeTitle = extractNodeTitle(nodeToTrack);

    const result = await insertNewAnalyticsLog(
      logDirection,
      analyticsSession,
      metadata,
      nodeType,
      nodeTitle,
      nodeId,
    );

    const { id, created_at: newLogCreatedAt } =
      result?.data.insert_analytics_logs_one || {};

    if (!id || !newLogCreatedAt) {
      return;
    }

    if (
      lastVisibleNodeAnalyticsLogId &&
      newLogCreatedAt &&
      !metadata.isAutoAnswered
    ) {
      updateLastLogWithNextLogCreatedAt(
        lastVisibleNodeAnalyticsLogId,
        newLogCreatedAt,
      );
    }

    if (!metadata.isAutoAnswered) {
      lastVisibleNodeAnalyticsLogId = id;
    }
  }

  async function insertNewAnalyticsLog(
    direction: AnalyticsLogDirection,
    analyticsId: number,
    metadata: NodeMetadata,
    nodeType: string | null,
    nodeTitle: string,
    nodeId: string | null,
  ) {
    const result = await publicClient.mutate({
      mutation: INSERT_NEW_ANALYTICS_LOG,
      variables: {
        flow_direction: direction,
        analytics_id: analyticsId,
        metadata: metadata,
        node_type: nodeType,
        node_title: nodeTitle,
        node_id: nodeId,
      },
    });
    return result;
  }

  async function updateLastLogWithNextLogCreatedAt(
    lastVisibleNodeAnalyticsLogId: number,
    newLogCreatedAt: Date,
  ) {
    await publicClient.mutate({
      mutation: UPDATE_NEXT_LOG_CREATED_AT,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        next_log_created_at: newLogCreatedAt,
      },
    });
  }

  function shouldSkipTracking() {
    return !shouldTrackAnalytics || !lastVisibleNodeAnalyticsLogId;
  }

  async function updateMetadata(mutation: DocumentNode, metadata?: Metadata) {
    await publicClient.mutate({
      mutation: mutation,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        metadata,
      },
    });
  }

  async function trackEvent(eventData: EventData) {
    if (shouldSkipTracking()) return;
    const { event } = eventData;
    switch (event) {
      case "helpClick":
        updateMetadata(UPDATE_HAS_CLICKED_HELP, eventData.metadata);
        return;
      case "saveClick":
        updateMetadata(UPDATE_HAS_CLICKED_SAVE);
        return;
      case "nextStepsClick":
      case "helpTextFeedback":
        updateMetadata(UPDATE_ANALYTICS_LOG_METADATA, eventData.metadata);
        return;
      case "backwardsNavigation": {
        const { initiator, nodeId } = eventData;
        const metadata = generateBackwardsNavigationMetadata(
          initiator,
          flow,
          nodeId,
        );
        updateMetadata(UPDATE_ANALYTICS_LOG_METADATA, metadata);
        return;
      }
      case "flowDirectionChange": {
        const { flowDirection } = eventData;
        handleFlowDirectionChange(flowDirection);
        return;
      }
      case "inputErrors": {
        const { error } = eventData;
        handleInputErrors(error);
        return;
      }
    }
  }

  async function handleFlowDirectionChange(
    flowDirection: AnalyticsLogDirection,
  ) {
    await publicClient.mutate({
      mutation: UPDATE_FLOW_DIRECTION,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        flow_direction: flowDirection,
      },
    });
  }

  async function createAnalytics(type: AnalyticsType) {
    if (!shouldTrackAnalytics) return;
    const userAgent = Bowser.parse(window.navigator.userAgent);
    const referrer = document.referrer || null;

    const response = await publicClient.mutate({
      mutation: INSERT_NEW_ANALYTICS,
      variables: {
        type,
        flow_id: flowId,
        user_agent: userAgent,
        referrer,
      },
    });
    const id = response.data.insert_analytics_one.id;
    setAnalyticsId(id);
    const currentNodeId = currentCard?.id;
    if (currentNodeId) track(currentNodeId, type, id);
  }

  async function updateLastVisibleNodeLogWithAllowListAnswers(
    nodeId: string,
    breadcrumb: Store.UserData,
  ) {
    if (shouldSkipTracking()) return;

    const allowListAnswers = getAllowListAnswers(
      nodeId,
      breadcrumb,
      flow,
      breadcrumbs,
    );
    if (!allowListAnswers) return;

    await publicClient.mutate({
      mutation: UPDATE_ALLOW_LIST_ANSWERS,
      variables: {
        id: lastVisibleNodeAnalyticsLogId, // TODO ensure this is correct id when isAutoanswered = true ! Currently lagging ~2 logs (need last log, not *visible* node) else empty mutation response
        allow_list_answers: allowListAnswers,
        node_id: nodeId,
      },
    });
  }

  /**
   * Capture user input errors caught by ErrorWrapper component
   */
  async function handleInputErrors(error: string) {
    if (shouldSkipTracking()) return;

    await publicClient.mutate({
      mutation: TRACK_INPUT_ERRORS,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        error,
      },
    });
  }

  function trackBreadcrumbChanges() {
    if (!breadcrumbs || !previousBreadcrumbs) return;

    const updatedBreadcrumbKeys = findUpdatedBreadcrumbKeys(
      breadcrumbs,
      previousBreadcrumbs,
    );
    if (!updatedBreadcrumbKeys) return;

    updatedBreadcrumbKeys.forEach((breadcrumbKey) => {
      const breadcrumb = breadcrumbs[breadcrumbKey];

      // track() is called from the Card, so auto-answers are naturally omitted because they aren't rendered to a user
      //   instead we manually insert their analytics_logs here
      if (breadcrumb?.auto) {
        track(breadcrumbKey);
      }

      // Any node should check for and record any allow-list answers
      updateLastVisibleNodeLogWithAllowListAnswers(breadcrumbKey, breadcrumb);
    });
  }
};

export function useAnalyticsTracking() {
  return useContext(analyticsContext);
}

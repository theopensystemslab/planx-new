import { DocumentNode } from "@apollo/client";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import Bowser from "bowser";
import { publicClient } from "lib/graphql";
import React, { createContext, useContext, useEffect } from "react";
import { usePrevious } from "react-use";

import {
  INSERT_NEW_ANALYTICS,
  INSERT_NEW_ANALYTICS_LOG,
  TRACK_INPUT_ERRORS,
  UPDATE_ALLOW_LIST_ANSWERS,
  UPDATE_ANALYTICS_LOG_METADATA,
  UPDATE_FLOW_DIRECTION,
  UPDATE_HAS_CLICKED_HELP,
  UPDATE_NEXT_LOG_CREATED_AT,
} from "./analyticsMutations";
import {
  AnalyticsLogDirection,
  AnalyticsType,
  EventData,
  Metadata,
  NodeMetadata,
} from "./analyticsTypes";
import {
  determineLogDirection,
  extractNodeTitle,
  findUpdatedBreadcrumbKeys,
  generateBackwardsNavigationMetadata,
  getAllowListAnswers,
  getNodeMetadata,
} from "./analyticsUtils";
import { Store, useStore } from "./store";

/**
 * If appending to ALLOW_LIST please also update the `analytics_summary` view to
 * extract it into it's own column.
 */
export const ALLOW_LIST = [
  "proposal.projectType",
  "application.declaration.connection",
  "property.type",
  "drawBoundary.action",
  "user.role",
  "property.constraints.planning",
] as const;

let lastVisibleNodeAnalyticsLogId: number | undefined = undefined;

const analyticsContext = createContext<{
  createAnalytics: (type: AnalyticsType) => Promise<void>;
  trackEvent: (eventData: EventData) => Promise<void>;
  node: Store.node | null;
  track: (
    nodeId: string,
    direction?: AnalyticsLogDirection,
    analyticsSessionId?: number,
  ) => Promise<void>;
}>({
  createAnalytics: () => Promise.resolve(),
  trackEvent: () => Promise.resolve(),
  node: null,
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
  const node = currentCard();
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
            process.env.REACT_APP_API_URL
          }/analytics/log-user-exit?analyticsLogId=${lastVisibleNodeAnalyticsLogId?.toString()}`,
        );
        break;
      case "visible":
        send(
          `${
            process.env.REACT_APP_API_URL
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
        node,
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

  async function updateMetadata(mutation: DocumentNode, metadata: Metadata) {
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
    const { event, metadata } = eventData;
    switch (event) {
      case "helpClick":
        updateMetadata(UPDATE_HAS_CLICKED_HELP, metadata);
        return;
      case "nextStepsClick":
        updateMetadata(UPDATE_ANALYTICS_LOG_METADATA, metadata);
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
    const currentNodeId = currentCard()?.id;
    if (currentNodeId) track(currentNodeId, type, id);
  }

  async function updateLastVisibleNodeLogWithAllowListAnswers(
    nodeId: string,
    breadcrumb: Store.userData,
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
        id: lastVisibleNodeAnalyticsLogId,
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
      if (breadcrumb.auto) {
        track(breadcrumbKey);
      } else {
        updateLastVisibleNodeLogWithAllowListAnswers(breadcrumbKey, breadcrumb);
      }
    });
  }
};

export function useAnalyticsTracking() {
  return useContext(analyticsContext);
}

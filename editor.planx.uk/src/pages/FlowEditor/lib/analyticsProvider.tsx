import { DocumentNode } from "@apollo/client";
import {
  DEFAULT_FLAG_CATEGORY,
  Flag,
  FlagSet,
} from "@opensystemslab/planx-core/types";
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
import { Store, useStore } from "./store";

export type AnalyticsType = "init" | "resume";
type AnalyticsLogDirection =
  | AnalyticsType
  | "forwards"
  | "backwards"
  | "reset"
  | "save";

/**
 * If appending to ALLOW_LIST please also update the `analytics_summary` view to
 * extract it into it's own column.
 */
const ALLOW_LIST = [
  "proposal.projectType",
  "application.declaration.connection",
  "property.type",
  "drawBoundary.action",
  "user.role",
  "property.constraints.planning",
] as const;

type AllowListKey = (typeof ALLOW_LIST)[number];

export type HelpClickMetadata = Record<string, string>;
type SelectedUrlsMetadata = Record<"selectedUrls", string[]>;
type BackwardsNavigationInitiatorType = "change" | "back";

type ResultNodeMetadata = {
  flag?: Flag;
  flagSet?: FlagSet;
  displayText?: {
    heading?: string;
    description?: string;
  };
};

type AutoAnswerMetadata = {
  isAutoAnswered?: boolean;
};

type NodeMetadata = ResultNodeMetadata & AutoAnswerMetadata;

type BackwardsTargetMetadata = {
  id?: string;
  type?: string | null;
  title?: string;
};

type BackwardsNavigationMetadata =
  | Record<"change", BackwardsTargetMetadata>
  | Record<"back", BackwardsTargetMetadata>;

/**
 * Describes the possible values that can be written to analytics_logs.metadata
 * by any one of the specific tracking event functions
 */
type Metadata =
  | NodeMetadata
  | BackwardsNavigationMetadata
  | SelectedUrlsMetadata
  | HelpClickMetadata;

let lastVisibleNodeAnalyticsLogId: number | undefined = undefined;

type EventData =
  | HelpClick
  | NextStepsClick
  | BackwardsNavigation
  | FlowDirectionChange
  | InputErrors;

/**
 * Capture when a user clicks on the `More Information` i.e. the help on a
 * question. The mutation directly applies "has_clicked_help: true" although
 * this can accept metadata as a currently if a user select `info` on a file
 * requirement that data can be stored in this field.
 */
type HelpClick = {
  event: "helpClick";
  metadata: HelpClickMetadata;
};

/**
 * A user gets to a `NextSteps` component. Track every time a user selects a
 * link and appends it to the array.
 */
type NextStepsClick = {
  event: "nextStepsClick";
  metadata: SelectedUrlsMetadata;
};

/**
 * A user selects either `Back` of `Change` this event it triggered which if
 * the `nodeId` is available the `metadata` will be updated with the type of
 * backwards navigation i.e. `back` or `change` and the value is data about
 * the node which will be navigated to.
 */
type BackwardsNavigation = {
  event: "backwardsNavigation";
  metadata: null;
  initiator: BackwardsNavigationInitiatorType;
  nodeId?: string;
};

/**
 * The flow direction when a new analytics session is created is
 * - 'init': for the flow no longerStorage data is found
 * - 'resume': for the flow localStorage data is found
 * - 'forwards': breadcrumbs are being appended to i.e. forwards through flow
 * - 'backwards': breadcrumbs are bing removed i.e. backwards through flow
 * - 'reset': a user restarts by clicking the 'reset' button
 * - 'save': a user ends a session by saving
 */
type FlowDirectionChange = {
  event: "flowDirectionChange";
  metadata: null;
  flowDirection: AnalyticsLogDirection;
};

/**
 * Captures when a user encounters an error as caught by the ErrorWrapper
 * appends the error message to an array of errors
 */
type InputErrors = {
  event: "inputErrors";
  metadata: null;
  error: string;
};

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
    const logDirection = direction || determineLogDirection();
    const analyticsSession = analyticsSessionId || analyticsId;

    if (!nodeToTrack || !logDirection || !analyticsSession) {
      return;
    }

    const metadata: NodeMetadata = getNodeMetadata(nodeToTrack, nodeId);
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
        const metadata = generateBackwardsNavigationMetadata(initiator, nodeId);
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

  function generateBackwardsNavigationMetadata(
    initiator: BackwardsNavigationInitiatorType,
    nodeId?: string,
  ) {
    const targetNodeMetadata = nodeId ? getTargetNodeDataFromFlow(nodeId) : {};
    const metadata: BackwardsNavigationMetadata =
      initiator === "change"
        ? { change: targetNodeMetadata }
        : { back: targetNodeMetadata };
    return metadata;
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

    const allowListAnswers = getAllowListAnswers(nodeId, breadcrumb);
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

  function getAllowListAnswers(
    nodeId: string,
    breadcrumb: Store.userData,
  ): Partial<Record<AllowListKey, any>> | undefined {
    const answers = getAnswers(nodeId);
    const data = getData(breadcrumb);

    if (!answers && !data) return;
    const allowListAnswers = Object.assign({}, answers, data);

    return allowListAnswers;
  }

  /**
   * Check whether the key is in the ALLOW_LIST and ensure it's of the correct
   * type to avoid repeated casting.
   */
  function isAllowListKey(key: any): key is AllowListKey {
    return (ALLOW_LIST as readonly string[]).includes(key);
  }

  /**
   * Extract allowlist answers from user answers
   * e.g., from Checklist or Question components
   */
  function getAnswers(
    nodeId: string,
  ): Partial<Record<AllowListKey, any>> | undefined {
    const { data } = flow[nodeId];
    const nodeFn: string | undefined = data?.fn || data?.val;

    if (!nodeFn || !isAllowListKey(nodeFn)) return;

    const answerIds = breadcrumbs[nodeId]?.answers;
    if (!answerIds) return;

    const answerValues = answerIds.map((answerId) => flow[answerId]?.data?.val);
    const filteredAnswerValues = answerValues.filter(Boolean);
    if (!filteredAnswerValues.length) return;

    const answers: Partial<Record<AllowListKey, string[]>> = {
      [nodeFn]: filteredAnswerValues,
    };

    return answers;
  }

  /**
   * Extract allowlist answers from breadcrumb data
   * e.g. data set automatically by components such as DrawBoundary
   */
  function getData(
    breadcrumb: Store.userData,
  ): Partial<Record<AllowListKey, any>> | undefined {
    const dataSetByNode = breadcrumb.data;
    if (!dataSetByNode) return;

    const filteredEntries = Object.entries(dataSetByNode)
      .filter(([key, value]) => isAllowListKey(key) && Boolean(value))
      .map(([key, value]) => ({ [key]: value }));

    if (!filteredEntries.length) return;
    const answerValues = Object.assign({}, ...filteredEntries);

    return answerValues;
  }

  function getNodeMetadata(node: Store.node, nodeId: string) {
    const isAutoAnswered = breadcrumbs[nodeId]?.auto || false;
    switch (node?.type) {
      case TYPES.Result: {
        const flagSet = node?.data?.flagSet || DEFAULT_FLAG_CATEGORY;
        const data = resultData(flagSet, node?.data?.overrides);
        const { displayText, flag } = data[flagSet];
        return {
          flagSet,
          displayText,
          flag,
          isAutoAnswered,
        };
      }
      default:
        return {
          isAutoAnswered,
        };
    }
  }

  function getTargetNodeDataFromFlow(nodeId: string) {
    const node = flow[nodeId];
    const nodeType = node?.type ? TYPES[node.type] : null;
    const nodeMetadata: BackwardsTargetMetadata = {
      title: extractNodeTitle(node),
      type: nodeType,
      id: nodeId,
    };
    return nodeMetadata;
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

  function extractNodeTitle(node: Store.node) {
    const nodeTitle =
      node?.type === TYPES.Content
        ? getContentTitle(node)
        : node?.data?.title ?? node?.data?.text ?? node?.data?.flagSet;
    return nodeTitle;
  }

  function determineLogDirection() {
    if (!previousBreadcrumbs) return;

    const curLength = Object.keys(breadcrumbs).length;
    const prevLength = Object.keys(previousBreadcrumbs).length;
    if (curLength > prevLength) return "forwards";
    if (curLength < prevLength) return "backwards";
  }

  function findUpdatedBreadcrumbKeys(): string[] | undefined {
    if (!previousBreadcrumbs) return;

    const currentKeys = Object.keys(breadcrumbs);
    const previousKeys = Object.keys(previousBreadcrumbs);
    const updatedBreadcrumbKeys = currentKeys.filter(
      (breadcrumb) => !previousKeys.includes(breadcrumb),
    );
    return updatedBreadcrumbKeys;
  }

  function trackBreadcrumbChanges() {
    const updatedBreadcrumbKeys = findUpdatedBreadcrumbKeys();
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

/**
 * Generate meaningful title for content analytic log
 */
function getContentTitle(node: Store.node): string {
  const dom = new DOMParser().parseFromString(node.data.content, "text/html");
  const h1 = dom.body.getElementsByTagName("h1")[0]?.textContent;
  const text = h1 || dom.body.textContent;
  if (!text) return `Content: ${node.id}`;
  const TITLE_LENGTH = 50;
  const truncate = (data: string) =>
    data.length > TITLE_LENGTH ? data.substring(0, TITLE_LENGTH) + "..." : data;
  const title = truncate(text);
  return title;
}

export function useAnalyticsTracking() {
  return useContext(analyticsContext);
}

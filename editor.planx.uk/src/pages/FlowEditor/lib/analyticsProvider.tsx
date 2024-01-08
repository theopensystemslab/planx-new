import { gql } from "@apollo/client";
import {
  DEFAULT_FLAG_CATEGORY,
  Flag,
  FlagSet,
} from "@opensystemslab/planx-core/types";
import { TYPES } from "@planx/components/types";
import Bowser from "bowser";
import { publicClient } from "lib/graphql";
import React, { createContext, useContext, useEffect } from "react";
import { usePrevious } from "react-use";

import { Store, useStore } from "./store";

export type AnalyticsType = "init" | "resume";
type AnalyticsLogDirection =
  | AnalyticsType
  | "forwards"
  | "backwards"
  | "reset"
  | "save";

const ALLOW_LIST = [
  "proposal.projectType",
  "application.declaration.connection",
] as const;

export type HelpClickMetadata = Record<string, string>;
export type SelectedUrlsMetadata = Record<"selectedUrls", string[]>;
export type BackwardsNavigationInitiatorType = "change" | "back";

type NodeMetadata = {
  flagSet?: FlagSet;
  displayText?: {
    heading?: string;
    description?: string;
  };
  flag?: Flag;
  title?: string;
  type?: string | null;
  id?: string;
  isAutoAnswered?: boolean;
};

let lastVisibleNodeAnalyticsLogId: number | undefined = undefined;

const analyticsContext = createContext<{
  createAnalytics: (type: AnalyticsType) => Promise<void>;
  trackHelpClick: (metadata?: HelpClickMetadata) => Promise<void>;
  trackNextStepsLinkClick: (metadata?: SelectedUrlsMetadata) => Promise<void>;
  trackFlowDirectionChange: (
    flowDirection: AnalyticsLogDirection,
  ) => Promise<void>;
  trackBackwardsNavigation: (
    backwardsNavigationType: BackwardsNavigationInitiatorType,
    nodeId?: string,
  ) => Promise<void>;
  node: Store.node | null;
  trackInputErrors: (error: string) => Promise<void>;
  track: (
    nodeId: string,
    direction?: AnalyticsLogDirection,
    analyticsSessionId?: number,
  ) => Promise<void>;
}>({
  createAnalytics: () => Promise.resolve(),
  trackHelpClick: () => Promise.resolve(),
  trackNextStepsLinkClick: () => Promise.resolve(),
  trackFlowDirectionChange: () => Promise.resolve(),
  trackBackwardsNavigation: () => Promise.resolve(),
  node: null,
  trackInputErrors: () => Promise.resolve(),
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
    skipUpdateIfNotTracking();
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
        trackHelpClick,
        trackNextStepsLinkClick,
        trackFlowDirectionChange,
        trackBackwardsNavigation,
        node,
        trackInputErrors,
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
    const nodeFn = nodeToTrack?.data?.fn || nodeToTrack?.data?.val;

    const result = await insertNewAnalyticsLog(
      logDirection,
      analyticsSession,
      metadata,
      nodeType,
      nodeTitle,
      nodeId,
      nodeFn,
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
    nodeFn: string | null,
  ) {
    const result = await publicClient.mutate({
      mutation: gql`
        mutation InsertNewAnalyticsLog(
          $flow_direction: String
          $analytics_id: bigint
          $metadata: jsonb
          $node_type: String
          $node_title: String
          $node_id: String
          $node_fn: String
        ) {
          insert_analytics_logs_one(
            object: {
              flow_direction: $flow_direction
              analytics_id: $analytics_id
              user_exit: false
              metadata: $metadata
              node_type: $node_type
              node_title: $node_title
              node_id: $node_id
              node_fn: $node_fn
            }
          ) {
            id
            created_at
          }
        }
      `,
      variables: {
        flow_direction: direction,
        analytics_id: analyticsId,
        metadata: metadata,
        node_type: nodeType,
        node_title: nodeTitle,
        node_id: nodeId,
        node_fn: nodeFn,
      },
    });
    return result;
  }

  async function updateLastLogWithNextLogCreatedAt(
    lastVisibleNodeAnalyticsLogId: number,
    newLogCreatedAt: Date,
  ) {
    await publicClient.mutate({
      mutation: gql`
        mutation UpdateNextLogCreatedAt(
          $id: bigint!
          $next_log_created_at: timestamptz
        ) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _set: { next_log_created_at: $next_log_created_at }
          ) {
            id
          }
        }
      `,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        next_log_created_at: newLogCreatedAt,
      },
    });
  }

  function skipUpdateIfNotTracking() {
    if (!shouldTrackAnalytics || !lastVisibleNodeAnalyticsLogId) {
      return;
    }
  }

  async function trackHelpClick(metadata?: HelpClickMetadata) {
    skipUpdateIfNotTracking();
    await publicClient.mutate({
      mutation: gql`
        mutation UpdateHasClickedHelp($id: bigint!, $metadata: jsonb = {}) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _set: { has_clicked_help: true }
            _append: { metadata: $metadata }
          ) {
            id
          }
        }
      `,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        metadata,
      },
    });
  }

  async function trackNextStepsLinkClick(metadata?: SelectedUrlsMetadata) {
    skipUpdateIfNotTracking();
    await publicClient.mutate({
      mutation: gql`
        mutation UpdateHasClickNextStepsLink(
          $id: bigint!
          $metadata: jsonb = {}
        ) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _append: { metadata: $metadata }
          ) {
            id
          }
        }
      `,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        metadata,
      },
    });
  }

  async function trackFlowDirectionChange(
    flowDirection: AnalyticsLogDirection,
  ) {
    skipUpdateIfNotTracking();
    await publicClient.mutate({
      mutation: gql`
        mutation UpdateFlowDirection($id: bigint!, $flow_direction: String) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _set: { flow_direction: $flow_direction }
          ) {
            id
          }
        }
      `,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        flow_direction: flowDirection,
      },
    });
  }

  async function trackBackwardsNavigation(
    initiator: BackwardsNavigationInitiatorType,
    nodeId?: string,
  ) {
    skipUpdateIfNotTracking();
    const targetNodeMetadata = nodeId ? getTargetNodeDataFromFlow(nodeId) : {};
    const metadata: Record<string, NodeMetadata> = {};
    metadata[`${initiator}`] = targetNodeMetadata;

    await publicClient.mutate({
      mutation: gql`
        mutation UpdateHaInitiatedBackwardsNavigation(
          $id: bigint!
          $metadata: jsonb = {}
        ) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _append: { metadata: $metadata }
          ) {
            id
          }
        }
      `,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        metadata,
      },
    });
  }

  async function createAnalytics(type: AnalyticsType) {
    if (!shouldTrackAnalytics) return;
    const userAgent = Bowser.parse(window.navigator.userAgent);
    const referrer = document.referrer || null;

    const response = await publicClient.mutate({
      mutation: gql`
        mutation InsertNewAnalytics(
          $type: String
          $flow_id: uuid
          $user_agent: jsonb
          $referrer: String
        ) {
          insert_analytics_one(
            object: {
              type: $type
              flow_id: $flow_id
              user_agent: $user_agent
              referrer: $referrer
            }
          ) {
            id
          }
        }
      `,
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

  async function updateLastVisibleNodeLogWithAllowListAnswers(nodeId: string) {
    skipUpdateIfNotTracking();

    const allowListAnswers = getAllowListAnswers(nodeId);
    if (!allowListAnswers) return;

    await publicClient.mutate({
      mutation: gql`
        mutation UpdateAllowListAnswers(
          $id: bigint!
          $allow_list_answers: jsonb
          $node_id: String!
        ) {
          update_analytics_logs(
            where: { id: { _eq: $id }, node_id: { _eq: $node_id } }
            _set: { allow_list_answers: $allow_list_answers }
          ) {
            returning {
              id
            }
          }
        }
      `,
      variables: {
        id: lastVisibleNodeAnalyticsLogId,
        allow_list_answers: allowListAnswers,
        node_id: nodeId,
      },
    });
  }

  function getAllowListAnswers(nodeId: string) {
    const { data } = flow[nodeId];
    const nodeFn = data?.fn || data?.val;
    if (nodeFn && ALLOW_LIST.includes(nodeFn)) {
      const answerIds = breadcrumbs[nodeId]?.answers;
      const answerValues = answerIds?.map((answerId) => {
        return flow[answerId]?.data?.val;
      });
      const filteredAnswers = answerValues?.filter(Boolean);
      return filteredAnswers;
    }
  }

  function getNodeMetadata(node: Store.node, nodeId: string) {
    const isAutoAnswered = breadcrumbs[nodeId]?.auto || false;
    switch (node?.type) {
      case TYPES.Result:
        const flagSet = node?.data?.flagSet || DEFAULT_FLAG_CATEGORY;
        const data = resultData(flagSet, node?.data?.overrides);
        const { displayText, flag } = data[flagSet];
        return {
          flagSet,
          displayText,
          flag,
          isAutoAnswered,
        };

      default:
        return {
          isAutoAnswered,
        };
    }
  }

  function getTargetNodeDataFromFlow(nodeId: string) {
    const node = flow[nodeId];
    const nodeType = node?.type ? TYPES[node.type] : null;
    const nodeMetadata: NodeMetadata = {
      title: extractNodeTitle(node),
      type: nodeType,
      id: nodeId,
    };
    return nodeMetadata;
  }

  /**
   * Capture user input errors caught by ErrorWrapper component
   */
  async function trackInputErrors(error: string) {
    skipUpdateIfNotTracking();
    await publicClient.mutate({
      mutation: gql`
        mutation TrackInputErrors($id: bigint!, $error: jsonb) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _append: { input_errors: $error }
          ) {
            id
          }
        }
      `,
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
        updateLastVisibleNodeLogWithAllowListAnswers(breadcrumbKey);
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

import { gql } from "@apollo/client";
import {
  DEFAULT_FLAG_CATEGORY,
  Flag,
  FlagSet,
} from "@opensystemslab/planx-core/types";
import { TYPES } from "@planx/components/types";
import Bowser from "bowser";
import { publicClient } from "lib/graphql";
import React, { createContext, useContext, useEffect, useState } from "react";

import { Store, useStore } from "./store";

export type AnalyticsType = "init" | "resume";
type AnalyticsLogDirection =
  | AnalyticsType
  | "forwards"
  | "backwards"
  | "reset"
  | "save";

const allowList = [
  "proposal.projectType",
  "application.delcaration.connection",
];

export type HelpClickMetadata = Record<string, string>;
export type SelectedUrlsMetadata = Record<"selectedUrls", string[]>;
export type BackwardsNavigationInitiatorType = "change" | "back";

type NodeMetadata = {
  flagset?: FlagSet;
  displayText?: {
    heading?: string;
    description?: string;
  };
  flag?: Flag;
  title?: string;
  type?: TYPES;
};

let lastAnalyticsLogId: number | undefined = undefined;

const analyticsContext = createContext<{
  createAnalytics: (type: AnalyticsType) => Promise<void>;
  trackHelpClick: (metadata?: HelpClickMetadata) => Promise<void>;
  trackNextStepsLinkClick: (metadata?: SelectedUrlsMetadata) => Promise<void>;
  trackFlowDirectionChange: (
    flowDirection: AnalyticsLogDirection,
  ) => Promise<void>;
  trackBackwardsNavigationByNodeId: (
    nodeId: string,
    backwardsNavigationType: BackwardsNavigationInitiatorType,
  ) => Promise<void>;
  node: Store.node | null;
  trackInputErrors: (error: string) => Promise<void>;
}>({
  createAnalytics: () => Promise.resolve(),
  trackHelpClick: () => Promise.resolve(),
  trackNextStepsLinkClick: () => Promise.resolve(),
  trackFlowDirectionChange: () => Promise.resolve(),
  trackBackwardsNavigationByNodeId: () => Promise.resolve(),
  node: null,
  trackInputErrors: () => Promise.resolve(),
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
    previousCard,
  ] = useStore((state) => [
    state.currentCard,
    state.breadcrumbs,
    state.analyticsId,
    state.setAnalyticsId,
    state.resultData,
    state.previewEnvironment,
    state.id,
    state.flow,
    state.previousCard,
  ]);
  const node = currentCard();
  const previousNodeId = previousCard(node);
  const isAnalyticsEnabled =
    new URL(window.location.href).searchParams.get("analytics") !== "false";
  const shouldTrackAnalytics =
    previewEnvironment === "standalone" && isAnalyticsEnabled;
  const [previousBreadcrumbs, setPreviousBreadcrumb] = useState(breadcrumbs);

  const onPageExit = () => {
    if (lastAnalyticsLogId && shouldTrackAnalytics) {
      if (document.visibilityState === "hidden") {
        send(
          `${
            process.env.REACT_APP_API_URL
          }/analytics/log-user-exit?analyticsLogId=${lastAnalyticsLogId.toString()}`,
        );
      }
      if (document.visibilityState === "visible") {
        send(
          `${
            process.env.REACT_APP_API_URL
          }/analytics/log-user-resume?analyticsLogId=${lastAnalyticsLogId?.toString()}`,
        );
      }
    }
  };

  useEffect(() => {
    if (shouldTrackAnalytics)
      document.addEventListener("visibilitychange", onPageExit);
    return () => {
      if (shouldTrackAnalytics)
        document.removeEventListener("visibilitychange", onPageExit);
    };
  }, []);

  // Track component transition
  useEffect(() => {
    if (shouldTrackAnalytics && analyticsId) {
      const curLength = Object.keys(breadcrumbs).length;
      const prevLength = Object.keys(previousBreadcrumbs).length;

      if (curLength > prevLength) track("forwards", analyticsId);
      if (curLength < prevLength) track("backwards", analyticsId);

      setPreviousBreadcrumb(breadcrumbs);
    }
  }, [breadcrumbs]);

  return (
    <Provider
      value={{
        createAnalytics,
        trackHelpClick,
        trackNextStepsLinkClick,
        trackFlowDirectionChange,
        trackBackwardsNavigationByNodeId,
        node,
        trackInputErrors,
      }}
    >
      {children}
    </Provider>
  );

  async function track(direction: AnalyticsLogDirection, analyticsId: number) {
    const metadata = getNodeMetadata();
    const nodeTitle =
      node?.type === TYPES.Content
        ? getContentTitle(node)
        : node?.data?.title ?? node?.data?.text ?? node?.data?.flagSet;
    // On component transition create the new analytics log
    const result = await insertNewAnalyticsLog(
      direction,
      analyticsId,
      metadata,
      nodeTitle,
    );
    const id = result?.data.insert_analytics_logs_one?.id;
    const newLogCreatedAt = result?.data.insert_analytics_logs_one?.created_at;

    // On successful create of a new log update the previous log with the next_log_created_at
    // This allows us to estimate how long a user spend on a card
    if (lastAnalyticsLogId && newLogCreatedAt) {
      updateLastLogWithNextLogCreatedAt(lastAnalyticsLogId, newLogCreatedAt);
    }

    if (lastAnalyticsLogId && previousNodeId) {
      await updateLastLogWithAllowListAnswers(
        lastAnalyticsLogId,
        previousNodeId,
      );
    }

    lastAnalyticsLogId = id;
  }

  async function insertNewAnalyticsLog(
    direction: AnalyticsLogDirection,
    analyticsId: number,
    metadata: NodeMetadata,
    nodeTitle: string,
  ) {
    const result = await publicClient.mutate({
      mutation: gql`
        mutation InsertNewAnalyticsLog(
          $flow_direction: String
          $analytics_id: bigint
          $metadata: jsonb
          $node_type: Int
          $node_title: String
          $user_agent: jsonb
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
        node_type: node?.type,
        node_title: nodeTitle,
        node_fn: node?.data?.fn || node?.data?.val,
      },
    });
    return result;
  }

  async function updateLastLogWithNextLogCreatedAt(
    lastAnalyticsLogId: number,
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
        id: lastAnalyticsLogId,
        next_log_created_at: newLogCreatedAt,
      },
    });
  }

  async function updateLastLogWithAllowListAnswers(
    lastAnalyticsLogId: number,
    previousNodeId: string,
  ) {
    const allowListAnswers = getAllowListAnswers(previousNodeId);
    if (allowListAnswers) {
      await publicClient.mutate({
        mutation: gql`
          mutation UpdateAllowListAnswers(
            $id: bigint!
            $allow_list_answers: jsonb
          ) {
            update_analytics_logs_by_pk(
              pk_columns: { id: $id }
              _set: { allow_list_answers: $allow_list_answers }
            ) {
              id
            }
          }
        `,
        variables: {
          id: lastAnalyticsLogId,
          allow_list_answers: allowListAnswers,
        },
      });
    }
  }

  async function trackHelpClick(metadata?: HelpClickMetadata) {
    if (shouldTrackAnalytics && lastAnalyticsLogId) {
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
          id: lastAnalyticsLogId,
          metadata,
        },
      });
    }
  }

  async function trackNextStepsLinkClick(metadata?: SelectedUrlsMetadata) {
    if (shouldTrackAnalytics && lastAnalyticsLogId) {
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
          id: lastAnalyticsLogId,
          metadata,
        },
      });
    }
  }

  async function trackFlowDirectionChange(
    flowDirection: AnalyticsLogDirection,
  ) {
    if (shouldTrackAnalytics && lastAnalyticsLogId) {
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
          id: lastAnalyticsLogId,
          flow_direction: flowDirection,
        },
      });
    }
  }

  async function trackBackwardsNavigationByNodeId(
    nodeId: string,
    initiator: BackwardsNavigationInitiatorType,
  ) {
    const targetNodeMetadata = getTitleAndTypeFromFlow(nodeId);
    const metadata: Record<string, NodeMetadata> = {};
    metadata[`${initiator}`] = targetNodeMetadata;

    if (shouldTrackAnalytics && lastAnalyticsLogId) {
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
          id: lastAnalyticsLogId,
          metadata,
        },
      });
    }
  }

  async function createAnalytics(type: AnalyticsType) {
    if (shouldTrackAnalytics) {
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
      track(type, id);
    }
  }

  function getNodeMetadata() {
    switch (node?.type) {
      case TYPES.Result:
        const flagSet = node?.data?.flagSet || DEFAULT_FLAG_CATEGORY;
        const data = resultData(flagSet, node?.data?.overrides);
        const { displayText, flag } = data[flagSet];
        return {
          flagSet,
          displayText,
          flag,
        };

      default:
        return {};
    }
  }

  function getTitleAndTypeFromFlow(nodeId: string) {
    const { data, type } = flow[nodeId];
    const nodeMetadata: NodeMetadata = {
      title: data?.text,
      type: type,
    };
    return nodeMetadata;
  }

  // Relies on being called at a point where the user has answered the Qs on the node.
  function getAllowListAnswers(nodeId: string) {
    const { data } = flow[nodeId];
    const nodeFn = data?.fn || data?.val || null;
    if (nodeFn && allowList.includes(nodeFn)) {
      const answerIds = breadcrumbs[nodeId].answers;
      const answerValues = answerIds?.map((answerId) => {
        return flow[answerId].data.val;
      });
      return answerValues;
    }
  }

  /**
   * Capture user input errors caught by ErrorWrapper component
   */
  async function trackInputErrors(error: string) {
    if (shouldTrackAnalytics && lastAnalyticsLogId) {
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
          id: lastAnalyticsLogId,
          error,
        },
      });
    }
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

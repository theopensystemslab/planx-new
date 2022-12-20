import { gql } from "@apollo/client";
import { TYPES } from "@planx/components/types";
import { client } from "lib/graphql";
import React, { createContext, useContext, useEffect, useState } from "react";

import { DEFAULT_FLAG_CATEGORY } from "../data/flags";
import { Store, useStore } from "./store";

export type AnalyticsType = "init" | "resume";
type AnalyticsLogDirection = AnalyticsType | "forwards" | "backwards";

let lastAnalyticsLogId: number | undefined = undefined;

const analyticsContext = createContext<{
  createAnalytics: (type: AnalyticsType) => Promise<void>;
  trackHelpClick: () => Promise<void>;
  node: Store.node | null;
}>({
  createAnalytics: () => Promise.resolve(),
  trackHelpClick: () => Promise.resolve(),
  node: null,
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
  ] = useStore((state) => [
    state.currentCard,
    state.breadcrumbs,
    state.analyticsId,
    state.setAnalyticsId,
    state.resultData,
    state.previewEnvironment,
    state.id,
  ]);
  const node = currentCard();
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
          }/analytics/log-user-exit?analyticsLogId=${lastAnalyticsLogId.toString()}`
        );
      }
      if (document.visibilityState === "visible") {
        send(
          `${
            process.env.REACT_APP_API_URL
          }/analytics/log-user-resume?analyticsLogId=${lastAnalyticsLogId?.toString()}`
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
        node,
      }}
    >
      {children}
    </Provider>
  );

  async function track(direction: AnalyticsLogDirection, analyticsId: number) {
    const metadata = getNodeMetadata();
    const node_title =
      node?.type === TYPES.Content
        ? "Content"
        : node?.data?.title ?? node?.data?.text ?? node?.data?.flagSet;

    const result = await client.mutate({
      mutation: gql`
        mutation InsertNewAnalyticsLog(
          $flow_direction: String
          $analytics_id: bigint
          $metadata: jsonb
          $node_type: Int
          $node_title: String
        ) {
          insert_analytics_logs_one(
            object: {
              flow_direction: $flow_direction
              analytics_id: $analytics_id
              user_exit: false
              metadata: $metadata
              node_type: $node_type
              node_title: $node_title
            }
          ) {
            id
          }
        }
      `,
      variables: {
        flow_direction: direction,
        analytics_id: analyticsId,
        metadata: metadata,
        node_type: node?.type,
        node_title: node_title,
      },
    });
    const id = result?.data.insert_analytics_logs_one?.id;
    lastAnalyticsLogId = id;
  }

  async function trackHelpClick() {
    if (shouldTrackAnalytics && lastAnalyticsLogId) {
      await client.mutate({
        mutation: gql`
          mutation UpdateHasClickedHelp($id: bigint!) {
            update_analytics_logs_by_pk(
              pk_columns: { id: $id }
              _set: { has_clicked_help: true }
            ) {
              id
            }
          }
        `,
        variables: {
          id: lastAnalyticsLogId,
        },
      });
    }
  }

  async function createAnalytics(type: AnalyticsType) {
    if (shouldTrackAnalytics) {
      const response = await client.mutate({
        mutation: gql`
          mutation InsertNewAnalytics($type: String, $flow_id: uuid) {
            insert_analytics_one(object: { type: $type, flow_id: $flow_id }) {
              id
            }
          }
        `,
        variables: {
          type,
          flow_id: flowId,
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
        const { displayText, flag, responses } = data[flagSet];
        return {
          flagSet,
          displayText,
          flag,
        };

      default:
        return {};
    }
  }
};

export function useAnalyticsTracking() {
  return useContext(analyticsContext);
}

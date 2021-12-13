import { gql } from "@apollo/client";
import { TYPES } from "@planx/components/types";
import { client } from "lib/graphql";
import { useEffect, useState } from "react";

import { DEFAULT_FLAG_CATEGORY } from "../data/flags";
import { useStore } from "./store";

export type AnalyticsType = "init" | "resume";
type AnalyticsLogDirection = AnalyticsType | "forwards" | "backwards";

let lastAnalyticsLogId: number | undefined = undefined;

const useAnalyticsTracking = () => {
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
  const isStandalone = previewEnvironment === "standalone";

  const [lastBreadcrumbs, setLastBreadcrumb] = useState(breadcrumbs);

  const onPageExit = () => {
    document.addEventListener("visibilitychange", () => {
      if (lastAnalyticsLogId && isStandalone) {
        if (document.visibilityState === "hidden") trackPageExit();
        if (document.visibilityState === "visible") trackPageResume();
      }
    });
  };

  useEffect(() => {
    onPageExit();
  }, []);

  useEffect(() => {
    if (isStandalone && analyticsId) {
      const currentBreadcrumbsLength = Object.keys(breadcrumbs).length;
      const storedBreadcrumbsLength = Object.keys(lastBreadcrumbs).length;

      if (currentBreadcrumbsLength > storedBreadcrumbsLength) {
        track("forwards", analyticsId);
      }
      if (currentBreadcrumbsLength < storedBreadcrumbsLength) {
        track("backwards", analyticsId);
      }
      setLastBreadcrumb(breadcrumbs);
    }
  }, [breadcrumbs]);

  return {
    createAnalytics,
    trackHelpClick,
  };

  function trackPageExit() {
    if (lastAnalyticsLogId !== undefined) {
      navigator.sendBeacon(
        `${
          process.env.REACT_APP_API_URL
        }/analytics/log-user-exit?analyticsLogId=${lastAnalyticsLogId.toString()}`
      );
    }
  }

  function trackPageResume() {
    navigator.sendBeacon(
      `${
        process.env.REACT_APP_API_URL
      }/analytics/log-user-resume?analyticsLogId=${lastAnalyticsLogId?.toString()}`
    );
  }

  async function track(direction: AnalyticsLogDirection, analyticsId: number) {
    const metadata = getNodeMetadata();
    const result = await client.mutate({
      mutation: gql`
        mutation InsertNewAnalyticsLog(
          $flow_direction: String
          $analytics_id: Int
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
        node_title:
          node?.data?.title ?? node?.data?.text ?? node?.data?.flagSet,
      },
    });
    const id = result?.data.insert_analytics_logs_one?.id;
    lastAnalyticsLogId = id;
  }

  async function trackHelpClick() {
    if (isStandalone && lastAnalyticsLogId) {
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

export default useAnalyticsTracking;

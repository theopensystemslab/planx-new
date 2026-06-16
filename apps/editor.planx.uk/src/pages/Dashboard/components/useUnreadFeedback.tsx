import { useQuery } from "@apollo/client";

import { GET_UNREAD_FEEDBACK_SUMMARY } from "./queries";

export interface FlowSummary {
  flowName: string;
  flowSlug: string;
  count: number;
}

export const useUnreadFeedback = (teamSlug: string) => {
  const { data, loading, error } = useQuery<{
    feedback_summary: { flowName: string; flowSlug: string }[];
  }>(GET_UNREAD_FEEDBACK_SUMMARY, {
    variables: { teamSlug },
  });

  const aggregated = (data?.feedback_summary ?? []).reduce<
    Record<string, { count: number; flowSlug: string }>
  >((acc, { flowName, flowSlug }) => {
    acc[flowName] = {
      count: (acc[flowName]?.count ?? 0) + 1,
      flowSlug,
    };
    return acc;
  }, {});

  const flows: FlowSummary[] = Object.entries(aggregated)
    .map(([flowName, { count, flowSlug }]) => ({ flowName, flowSlug, count }))
    .sort((a, b) => b.count - a.count);

  const total = flows.reduce((sum, { count }) => sum + count, 0);

  return { flows, total, loading, error };
};

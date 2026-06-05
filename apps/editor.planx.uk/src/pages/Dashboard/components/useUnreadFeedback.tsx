import { useQuery } from "@apollo/client";

import { GET_UNREAD_FEEDBACK_SUMMARY } from "./queries";

export interface FlowSummary {
  flowName: string;
  count: number;
}

export const useUnreadFeedback = (teamSlug: string) => {
  const { data, loading, error } = useQuery<{
    feedback_summary: { flowName: string }[];
  }>(GET_UNREAD_FEEDBACK_SUMMARY, {
    variables: { teamSlug },
  });

  const counts = (data?.feedback_summary ?? []).reduce<Record<string, number>>(
    (acc, { flowName }) => {
      acc[flowName] = (acc[flowName] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const flows: FlowSummary[] = Object.entries(counts)
    .map(([flowName, count]) => ({ flowName, count }))
    .sort((a, b) => b.count - a.count);

  const total = flows.reduce((sum, { count }) => sum + count, 0);

  return { flows, total, loading, error };
};

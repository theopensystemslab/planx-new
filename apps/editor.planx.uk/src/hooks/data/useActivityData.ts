import { gql, useQuery } from "@apollo/client";
import { useStore } from "pages/FlowEditor/lib/store";

const GET_ACTIVITY_BY_SERVICE = gql`
  query GetActivityByService($teamId: Int!) {
    flows(
      where: { team_id: { _eq: $teamId }, deleted_at: { _is_null: true } }
    ) {
      name
      sessions: lowcal_sessions_aggregate(
        where: { deleted_at: { _is_null: true } }
      ) {
        aggregate {
          count
        }
      }
      submissions: lowcal_sessions_aggregate(
        where: {
          deleted_at: { _is_null: true }
          submitted_at: { _is_null: false }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  }
`;

type FlowActivity = {
  name: string;
  sessions: { aggregate: { count: number } | null };
  submissions: { aggregate: { count: number } | null };
};

type GetActivityByServiceQuery = {
  flows: FlowActivity[];
};

export type ActivityItem = {
  name: string;
  count: number;
};

const TOP_LIMIT = 5;

export const useActivityData = (): {
  sessions: ActivityItem[];
  submissions: ActivityItem[];
  loading: boolean;
} => {
  const teamId = useStore((state) => state.teamId);

  const { data, loading } = useQuery<GetActivityByServiceQuery>(
    GET_ACTIVITY_BY_SERVICE,
    {
      variables: { teamId },
      skip: !teamId,
    },
  );

  const flows = data?.flows ?? [];

  const sessions = flows
    .map(({ name, sessions }) => ({
      name,
      count: sessions.aggregate?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_LIMIT);

  const submissions = flows
    .map(({ name, submissions }) => ({
      name,
      count: submissions.aggregate?.count ?? 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_LIMIT);

  return { sessions, submissions, loading };
};

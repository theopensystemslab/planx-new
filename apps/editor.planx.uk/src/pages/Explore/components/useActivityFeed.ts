import { gql, useQuery } from "@apollo/client";

export enum ActivityEventType {
  TeamJoined = "team_joined",
  ServiceOnline = "service_online",
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  eventTime: string;
  teamName: string;
  teamSlug: string;
  isTrial: boolean;
  flowName: string | null;
  flowSlug: string | null;
}

const EVENTS_LIMIT = 20;

const GET_PLATFORM_ACTIVITY_FEED = gql`
  query GetPlatformActivityFeed($limit: Int!) {
    events: platform_activity_feed(
      order_by: { event_time: desc }
      limit: $limit
    ) {
      id
      type
      eventTime: event_time
      teamName: team_name
      teamSlug: team_slug
      isTrial: is_trial
      flowName: flow_name
      flowSlug: flow_slug
    }
  }
`;

export const useActivityFeed = () =>
  useQuery<{ events: ActivityEvent[] }>(GET_PLATFORM_ACTIVITY_FEED, {
    variables: { limit: EVENTS_LIMIT },
  });

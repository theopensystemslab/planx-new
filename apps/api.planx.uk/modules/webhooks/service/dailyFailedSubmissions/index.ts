import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";

interface FailedSubmissions {
  data: {
    failedSubmissions:
      | {
          sessionId: string;
          flowName: string;
          eventType: string;
          teamName: string;
        }[]
      | [];
  };
}

export const getDailyFailedSubmissions = async () => {
  const { data } = await $api.client.request<FailedSubmissions>(gql`
    query GetDailyFailedSubmissions {
      failedSubmissions: daily_failed_submissions {
        sessionId: session_id
        flowName: flow_name
        eventType: event_type
        teamName: name
      }
    }
  `);
};

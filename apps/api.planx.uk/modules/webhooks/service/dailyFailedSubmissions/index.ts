import { gql } from "graphql-request";

import { $api } from "../../../../client/index.js";
import { sendSlackMessage } from "../../../slack/utils.js";

interface FailedSubmissions {
  data: {
    failedSubmissions:
      | {
          sessionId: string;
          eventType: string;
          teamName: string;
        }[]
      | [];
  };
}

export const getDailyFailedSubmissions = async (): Promise<string> => {
  const { data } = await $api.client.request<FailedSubmissions>(gql`
    query GetDailyFailedSubmissions {
      failedSubmissions: daily_failed_submissions {
        sessionId: session_id
        eventType: event_type
        teamName: name
      }
    }
  `);

  if (!data || data.failedSubmissions?.length === 0)
    return "No recent submission failures";

  const failures: string[] = [];
  for (const failure of data.failedSubmissions) {
    // Skip notifications related to Southwark Power Automate, which we expect to fail as of June 2026
    if (
      failure.teamName !== "Southwark" &&
      failure.eventType !== "Upload to AWS S3"
    ) {
      failures.push(`- *${failure.sessionId}* ${failure.eventType}`);
    }
  }

  // If we have failures, send a Slack notification
  if (failures.length > 0) {
    const message = `Please investigate recently failed submission(s):\n ${failures.join("\n")}`;
    sendSlackMessage({
      channel: "#planx-notifications-internal",
      text: message,
      username: "Failed Submissions CRON Job",
    });
  }

  return `Sent Slack notification for ${failures.length} recent submission failure(s)`;
};

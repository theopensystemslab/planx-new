import { useMutation } from "@tanstack/react-query";
import { sendSlackMessage } from "api/slack/requests";
import { useStore } from "pages/FlowEditor/lib/store";

const SKIPPED_TEAMS = [
  "open-digital-planning",
  "opensystemslab",
  "planx-university",
  "templates",
  "testing",
  "wikihouse",
];

/**
 * Send a Slack notification to #planx-notifications
 */
export const useSlackMessage = () => {
  const teamSlug = useStore((state) => state.teamSlug);

  return useMutation({
    mutationFn: async (message: string) => {
      if (SKIPPED_TEAMS.includes(teamSlug)) return;
      return sendSlackMessage(message);
    },
  });
};

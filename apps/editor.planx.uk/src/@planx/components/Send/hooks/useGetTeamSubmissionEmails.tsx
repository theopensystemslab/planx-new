import { useQuery } from "@apollo/client";
import { GET_TEAM_SUBMISSION_EMAILS } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/queries";
import type { GetSubmissionEmails } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

import type { GetTeamSubmissionEmailsQueryVariables } from "../types";

export const useTeamSubmissionEmails = (teamId: number) => {
  const query = useQuery<
    GetSubmissionEmails,
    GetTeamSubmissionEmailsQueryVariables
  >(GET_TEAM_SUBMISSION_EMAILS, {
    variables: { teamId },
    fetchPolicy: "network-only",
  });

  return query;
};

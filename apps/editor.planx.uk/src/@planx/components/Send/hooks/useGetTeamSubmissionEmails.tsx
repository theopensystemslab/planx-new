import { useQuery } from "@apollo/client";
import { GET_TEAM_SUBMISSION_EMAILS } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/queries";
import { GetSubmissionEmails } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

import { GetTeamSubmissionEmailsQueryVariables } from "../types";

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

import { useQuery } from "@apollo/client";
import { GET_TEAM_SUBMISSION_INTEGRATIONS } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/queries";
import { GetSubmissionEmails } from "pages/FlowEditor/components/Settings/Team/Integrations/SubmissionEmails/types";

import { GetTeamSubmissionIntegrationsQueryVariables } from "../types";

export const useTeamSubmissionIntegrations = (teamId: number) => {
  const { data, loading, error } = useQuery<
    GetSubmissionEmails,
    GetTeamSubmissionIntegrationsQueryVariables
  >(GET_TEAM_SUBMISSION_INTEGRATIONS, {
    variables: { teamId },
  });

  return { data, loading, error };
};

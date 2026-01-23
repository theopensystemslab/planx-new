export interface GetFlowEmailIdQuery {
  flowIntegrations: Array<{
    emailId: string;
  }>;
}

export interface GetFlowEmailIdQueryVariables {
  flowId: string;
}

export interface InsertSubmissionIntegrationMutation {
  insert_submission_integrations_one: {
    team_id: string;
    id: string;
    submission_email: string;
    default_email: false;
  };
}

export interface InsertSubmissionIntegrationMutationVariables {
  teamId: number;
  submissionEmail: string;
  defaultEmail: false;
}

export interface UpdateFlowIntegrationMutation {
  update_flow_integrations: {
    affected_rows: number;
  };
}

export interface UpdateFlowIntegrationMutationVariables {
  flowId: string;
  emailId: string;
}

export interface GetTeamSubmissionIntegrationsQuery {
  submissionIntegrations: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface GetTeamSubmissionIntegrationsQueryVariables {
  teamId: number;
}

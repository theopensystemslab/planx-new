export interface GetFlowEmailIdQuery {
  flowIntegrations: Array<{
    emailId: string;
  }>;
}

export interface GetFlowEmailIdQueryVariables {
  flowId: string;
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

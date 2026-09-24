export interface VisibilityFormValues {
  canCreateFromCopy: boolean;
}

export interface GetFlowVisibilityData {
  flows: {
    id: string;
    canCreateFromCopy: boolean;
    team: {
      settings: {
        isTrial: boolean;
      };
    };
  }[];
}

export interface UpdateFlowVisibilityVariables {
  flowId: string;
  canCreateFromCopy: boolean;
}

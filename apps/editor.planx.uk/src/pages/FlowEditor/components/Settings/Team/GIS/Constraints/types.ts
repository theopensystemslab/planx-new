export interface TeamConstraintsFormValues {
  hasPlanningData: boolean;
}

export interface GetTeamConstraintsData {
  integrations: {
    hasPlanningData: boolean;
  }[];
}

export interface UpdateTeamConstraintsVariables {
  teamId: number;
  hasPlanningData: boolean;
}

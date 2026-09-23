export interface LocalPlanningAuthorityFormValues {
  isLpa: boolean;
}

export interface GetTeamIsLpaData {
  teams: {
    id: number;
    isLpa: boolean;
  }[];
}

export interface UpdateTeamIsLpaVariables {
  teamId: number;
  isLpa: boolean;
}

export interface TrialAccountFormValues {
  isTrial: boolean;
}

export interface GetTeamSettingsData {
  teams: {
    id: string;
    settings: {
      isTrial: boolean;
    };
  }[];
}

export interface UpdateTeamSettingsVariables {
  teamId: number;
  settings: {
    is_trial: boolean;
  };
}

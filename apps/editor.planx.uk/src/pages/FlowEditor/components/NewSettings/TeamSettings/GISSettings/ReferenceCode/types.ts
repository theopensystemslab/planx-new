export interface ReferenceCodeFormValues {
  referenceCode: string;
}

export interface GetTeamSettingsData {
  teams: {
    id: string;
    settings: {
      referenceCode: string;
    };
  }[];
}

export interface UpdateTeamSettingsVariables {
  teamId: number;
  settings: {
    reference_code: string;
  };
}

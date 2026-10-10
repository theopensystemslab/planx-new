export interface GuidanceOnlyFormValues {
  isGuidanceOnly: boolean;
}

export interface GetTeamSettingsData {
  teams: {
    id: string;
    settings: {
      isGuidanceOnly: boolean;
    };
  }[];
}

export interface UpdateTeamSettingsVariables {
  teamId: number;
  settings: {
    is_guidance_only: boolean;
  };
}

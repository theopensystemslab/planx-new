export interface ContactFormValues {
  helpEmail: string;
  helpPhone: string;
  helpOpeningHours: string;
  homepage: string;
}

export interface GetTeamSettingsData {
  teams: {
    id: string;
    settings: {
      helpEmail: string;
      helpPhone: string;
      helpOpeningHours: string;
      homepage: string;
    };
  }[];
}

export interface UpdateTeamSettingsVariables {
  teamId: number;
  settings: {
    help_email: string;
    help_phone: string;
    help_opening_hours: string;
    homepage: string;
  };
}

export interface SubmissionEmailFormValues {
  submissionEmail: string;
}

export interface GetTeamSettingsData {
  teams: {
    id: string;
    settings: {
      submissionEmail: string;
    };
  }[];
}

export interface UpdateTeamSettingsVariables {
  teamId: number;
  settings: {
    submission_email: string;
  };
}

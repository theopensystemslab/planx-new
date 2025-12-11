CREATE TABLE public.submission_integrations (
    team_id INTEGER NOT NULL,
    email_id UUID NOT NULL,
    submission_email TEXT NOT NULL,
    default_email BOOLEAN NOT NULL,
    PRIMARY KEY (email_id),
    CONSTRAINT fk_submission_integrations_team_settings 
        FOREIGN KEY (team_id) 
        REFERENCES public.team_settings(team_id)
);

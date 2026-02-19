ALTER TABLE public.submission_integrations
  DROP CONSTRAINT fk_submission_integrations_team_settings;

ALTER TABLE public.submission_integrations
  ADD CONSTRAINT fk_submission_integrations_team_settings
    FOREIGN KEY (team_id)
    REFERENCES public.team_settings(team_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;

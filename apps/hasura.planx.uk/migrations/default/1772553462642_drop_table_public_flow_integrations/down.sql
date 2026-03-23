CREATE TABLE public.flow_integrations (
    flow_id UUID NOT NULL,
    team_id INTEGER,
    email_id UUID,
    PRIMARY KEY (flow_id),
    CONSTRAINT fk_flow_integrations_flows 
        FOREIGN KEY (flow_id) 
        REFERENCES public.flows(id)
);

INSERT INTO flow_integrations (flow_id, team_id)
SELECT f.id, f.team_id, f.submission_email_id
FROM flows f
WHERE f.deleted_at IS NULL;
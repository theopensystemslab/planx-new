CREATE TYPE session_event_type AS ENUM(
  'human_decision',
  'automatic_decision'
);

CREATE TABLE sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flow_id uuid NOT NULL,
    flow_version integer NOT NULL,
    flow_data jsonb NOT NULL,
    passport jsonb NOT NULL,
    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz,
    completed_at timestamptz
);
ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_flow_id_fkey FOREIGN KEY (flow_id) REFERENCES flows(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
CREATE TRIGGER set_sessions_updated_at BEFORE UPDATE ON flows FOR EACH ROW EXECUTE PROCEDURE set_current_timestamp_updated_at();

CREATE TABLE session_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    type session_event_type NOT NULL,
    chosen_node_ids uuid[] NOT NULL,
    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz
);
COMMENT ON TABLE session_events IS 'Represents the answer to one question/node in the flow';
ALTER TABLE ONLY session_events
    ADD CONSTRAINT session_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY session_events
    ADD CONSTRAINT session_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;
CREATE TRIGGER set_sessions_updated_at BEFORE UPDATE ON session_events FOR EACH ROW EXECUTE PROCEDURE set_current_timestamp_updated_at();

CREATE OR REPLACE FUNCTION check_guidance_only_flow_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check transitions into an online state, so flows which are already online remain editable
  IF NEW.status = 'online'
    AND (
      OLD.status IS DISTINCT FROM 'online'
      OR OLD.team_id IS DISTINCT FROM NEW.team_id
    )
    AND EXISTS (
      SELECT 1
      FROM team_settings ts
      WHERE ts.team_id = NEW.team_id
        AND ts.is_guidance_only
    )
    AND COALESCE((
      SELECT pf.has_send_component
      FROM published_flows pf
      WHERE pf.flow_id = NEW.id
      ORDER BY pf.created_at DESC
      LIMIT 1
    ), FALSE)
  THEN
    RAISE EXCEPTION
      USING ERRCODE = '22000',
            MESSAGE = 'Your current contract doesn''t include submission services. Contact the OSL team to upgrade';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.flow_production_url(flow_row flows)
RETURNS TEXT 
AS $$
  SELECT 
    CASE 
      WHEN t.domain IS NOT NULL AND t.domain != '' 
      THEN 'https://' || t.domain || '/' || flow_row.slug
      ELSE 'https://editor.planx.uk/' || t.slug || '/' || flow_row.slug || '/published'
    END
  FROM teams t
  WHERE t.id = flow_row.team_id
$$ LANGUAGE sql STABLE;

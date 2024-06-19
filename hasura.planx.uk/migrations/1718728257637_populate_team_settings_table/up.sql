INSERT INTO team_settings (team_id, reference_code, homepage, help_email, help_phone,help_opening_hours ,email_reply_to_id,has_planning_data , external_planning_site_url,external_planning_site_name,boundary_url,boundary_json)
SELECT 
id as team_id,
reference_code,
settings ->> 'homepage' as homepage,
COALESCE(notify_personalisation ->> 'helpEmail', 'example@council.co.uk') as help_email,
COALESCE(notify_personalisation ->> 'helpPhone', '(01234) 567890') as help_phone,
COALESCE(notify_personalisation ->> 'helpOpeningHours', 'Monday - Friday, 9am - 5pm') as help_opening_hours,
COALESCE(notify_personalisation ->> 'emailReplyToId', '727d48fa-cb8a-42f9-b8b2-55032f3bb451') as email_reply_to_id,
CAST(COALESCE(settings ->> 'hasPlanningData', 'false' ) as boolean) as has_planning_data,
COALESCE(settings #>> '{externalPlanningSite,url}', 'https://www.planningportal.co.uk/' ) as external_planning_site_url,
COALESCE(settings #>> '{externalPlanningSite,name}', 'Planning Portal') as external_planning_site_name,
settings ->> 'boundary' as boundary_url,
boundary as boundary_json
FROM teams;

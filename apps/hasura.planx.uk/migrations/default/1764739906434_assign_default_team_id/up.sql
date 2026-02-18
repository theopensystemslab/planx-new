with
    platform_admins as (
        select id, null::integer as team_id, 'is_platform_admin' as bucket from users where is_platform_admin = 't'
    ),
    analysts as (
        select id, null::integer as team_id, 'is_analyst' as bucket from users where is_analyst = 't'
    ),
    mchlg_staff as (
        select id, null::integer as team_id, 'is_mchlg_staff' as bucket from users where email like '%@localdigital.gov.uk'
    ),
    null_email_users as (
        select id, null::integer as team_id, 'has_null_email' as bucket from users where email is null
    ),
    
    -- Union these as the "null" default team
    null_default_team as (
        select * from platform_admins
        union all
        select * from analysts
        union all
        select * from mchlg_staff
        union all
        select * from null_email_users
    ),
    
    -- Demo users: default_team_id is 32
    demo_users as (
        select user_id as id, 32 as team_id, 'is_demo_user' as bucket from team_members where role = 'demoUser' 
    ),
    
    -- remaining users: who's in just 1 team?
    one_team_users as (
    
        select users.id, team_members.team_id, 'one_team_user' as bucket from users
        INNER JOIN team_members on team_members.user_id = users.id
        
        -- get the user ids that only appear 1x in team_members
        where users.id in (
            SELECT users.id
            FROM users
            INNER JOIN team_members on team_members.user_id = users.id
            GROUP BY users.id
            HAVING COUNT(*) = 1
        )
        
        -- exclude previous buckets
        and users.id not in (
            select id from null_default_team
            union all
            select id from demo_users
        )
    
    ),
    
    -- put previous buckets together to figure out...
    unioned as (
        select * from null_default_team
        union all
        select * from one_team_users
        union all
        select * from demo_users
    ),
    
    -- ... who's left over? we'll look at emails
    remainder as (
        select * from users where id not in
        (select id from unioned)
    ),
    
    buckinghamshire_email as (
        select id, 4 as team_id, 'buckinghamshire_email' as bucket from remainder
        where email like '%@buckinghamshire.gov.uk'
    ),
    gloucester_email as (
        select id, 19 as team_id, 'gloucester_email' as bucket from remainder
        where email like '%@gloucester.gov.uk'
    ),
    barnet_email as (
        select id, 26 as team_id, 'barnet_email' as bucket from remainder
        where email like '%@barnet.gov.uk'  
    ),
    tewkesbury_email as (
      select id, 25 as team_id, 'tewkesbury_email' as bucket from remainder
      where email like '%tewkesburybc%'
    ),


    
    -- union of all email assignments
    assigned_by_email as (
        select * from buckinghamshire_email
        union all
        select * from gloucester_email
        union all
        select * from barnet_email
        union all
        select * from tewkesbury_email
    ),

    -- final list of updates
    final_to_update as (
        select * from unioned
        union all
        select * from assigned_by_email
    )
    
update users
set default_team_id = final_to_update.team_id
from final_to_update
where users.id = final_to_update.id;

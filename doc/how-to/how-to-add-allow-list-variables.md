# How to add `ALLOW_LIST` variables for analytics

## Context

For PlanX, we are using a platform called Metabase to handle analytics for how people use the services from different local authorities. In order to tell Metabase what to pick up, we allow a number of variables to be exposed, these are contained in an array called `ALLOW_LIST`. You can see these as database columns in Hasura, in the views `analytics_summary` and `submission_services_summary`.

In these docs I will run through the steps for adding a new value to `ALLOW_LIST` both in the codebase and in Hasura. 

## Process

### Step 1 - Add variables to `ALLOW_LIST` array

 You will need to add the desired variables to two places in the codebase
  `api.planx.uk/modules/webhooks/service/analyzeSessions/operations.ts` and `editor.planx.uk/src/pages/FlowEditor/lib/analytics/provider.tsx`. 

  Each file should have an array looking like the below:

    ```ts
    export const ALLOW_LIST = [
      "application.declaration.connection",
      "application.information.harmful",
      "application.information.sensitive",
      "application.type",
    ...
      "service.type",
      "usedFOIYNPP",
      "user.role",
      *your variable*,
    ] as const;
    ```

  Add your variable to this array.

  *It is worth noting here that variables should be added in alphabetical order and relate to a respective passport variable*

  With both arrays now populated with the new variable we can now add them to our database views in Hasura
### Step 2 - Adding variables to Hasura Views

  For this part, you will need to pull the variable out of the passport jsonb in the SQL script and put them into two database views,`analytics_summary` and `submission_services_summary`. Examples can be found already in the current view script for how to do this.

  Example to look for:

```sql
  /* Example from submission_services_summary */
  (((ls.allow_list_answers -> 'application.type'::text) -> 0))::text AS application_type

  /*Example from analytics_summary */
  (((al.allow_list_answers -> 'application.type'::text) -> 0))::text AS application_type
```

  Example of how a view may look:

```sql
  CREATE OR REPLACE VIEW "public"."submission_services_summary" AS 
  WITH resumes_per_session AS
  /* deleted the code here for readability */
  SELECT (ls.id)::text AS session_id,
      t.slug AS team_slug,
      f.slug AS service_slug,
      ls.created_at,
      ls.submitted_at,
      ((ls.submitted_at)::date - (ls.created_at)::date) AS session_length_days,
      ls.has_user_saved AS user_clicked_save,
      rps.number_times_resumed,
      ls.allow_list_answers,
      ((ls.allow_list_answers -> 'proposal.projectType'::text))::text AS proposal_project_type,
      ((ls.allow_list_answers -> 'application.declaration.connection'::text))::text AS application_declaration_connection,
      ((ls.allow_list_answers -> 'property.type'::text))::text AS property_type,
      ((ls.allow_list_answers -> 'drawBoundary.action'::text))::text AS draw_boundary_action,
      ((ls.allow_list_answers -> 'user.role'::text))::text AS user_role,
      ((ls.allow_list_answers -> 'property.constraints.planning'::text))::text AS property_constraints_planning,
      /* deleted the code here for readability */
      sa.s3_applications,
      ((ls.allow_list_answers -> 'usedFOIYNPP'::text))::text AS used_foiynpp,
      ((ls.allow_list_answers -> 'propertyInformation.action'::text))::text AS property_information_action,
      ((ls.allow_list_answers -> 'planningConstraints.action'::text))::text AS planning_constraints_action,
      ((ls.allow_list_answers -> '_overrides'::text))::text AS overrides,
      ((ls.allow_list_answers -> 'rab.exitReason'::text))::text AS rab_exit_reason,
      ((ls.allow_list_answers -> 'service.type'::text))::text AS pre_app_service_type,
      ((ls.allow_list_answers -> 'application.information.harmful'::text))::text AS pre_app_harmful_info,
      ((ls.allow_list_answers -> 'application.information.sensitive'::text))::text AS pre_app_sensitive_info,
      (((ls.allow_list_answers -> 'application.type'::text) -> 0))::text AS application_type
    FROM lowcal_sessions ls
    /* deleted the code here for readability */
    WHERE ((f.slug IS NOT NULL) AND (t.slug IS NOT NULL));
```

  The values here are being pulled from the table `lowcal_sessions.allow_list_answers` or `analytics_logs.allow_list_answers`

  At the end of your SQL script after the view creation/replacement, it is important to add another line after each one.

  `GRANT SELECT ON public.{VIEW_NAME} TO metabase_read_only`

  **This ensures it is picked up by metabase and is a critical step in enabling your new `ALLOW_LIST` variables**

  🎊🎉🎈 Now your new variable is ready for testing 🎈🎉🎊

### Step 3 - Testing your new `ALLOW_LIST` variable

  Now you can begin testing your a service where your new passport variable is set, and as it is populated in the passport, it should come through to your new view.column. 

  Key to ensure that it is coming through in the right format, and with the expected value. A typical issue may be that it comes through as something like `['your value']` which will be read as `jsonb` by metabase and only allow boolean based filtering when creating dashboards, _does it exist or not_

  You will need to alter your SQL script for creating the new view to fix this


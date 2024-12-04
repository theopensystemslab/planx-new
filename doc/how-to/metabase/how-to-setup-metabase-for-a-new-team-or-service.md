# How to setup a Metabase collection for a new team

## What is Metabase?
[Metabase](https://www.metabase.com/) is an open source BI service which we self-host as part of PlanX. It allows teams to view and self-serve analytics dashboards related to their flows, applications, and users.

Metabase is set up and running on both Staging and Production environments, but only the Production instance (with Production data) has dashboards maintained and curated for teams.

## Context
The Metabase analytics dashboards are currently created per-published service.

We would like to automate this process as much as possible, but currently it is _all manual_. 

This means that each time a council goes live with a service, they let us know (eg via Slack) and we go through the process below.

## Process

To do any of the below, you will need to be logged into the Production Metabase service at https://metabase.editor.planx.uk/. Login details are stored on the OSL 1Password account.

### Setting up Metabase for a new team

_This happens only if a team is new / about to publish their first live service._

1. Check if a team Collection (folder) already exists in Metabase. If not, create a new one. 

![Screenshot - Add a Collection](./images/setup-metabase/new_collection.png)

### Setting up Metabase for a new Service

_This happens after a team lets us know that a service is going live._

1. Enter the 'Templates' Collection using the navigation bar on the left and duplicate the relevant template, replacing 'Template' with the council name. Duplicate it into the relevant team's Collection (folder).

![Screenshot - Templates Collection](./images/setup-metabase/templates.png)
![Screenshot - Duplicate the dashboard](./images/setup-metabase/duplicate_a_dashboard.png)

   * Ensure "Only duplicate the dashboard" is selected. This avoids unecessarily duplicating the visualisations which we maintain, and also means if we need to update anything, the changes will propagate across the dashboards.

![Screenshot - Only duplicate the dashboard](./images/setup-metabase/only_duplicate_dashboard.png)

   * Not all teams host the same services on PlanX. Ensure you only duplicate Dashboards for public, live flows. This can be checked via the PlanX Editor. We currently only have templates for three services: Find Out If You Need Planning Permission, Apply for a Lawful Development Service, and Report a Breach.

2. Navigate to the new Dashboard to update the team slug and service slug default value variables.

![Screenshot - Team slug variable](./images/setup-metabase/team_slug_default_value.png)
![Screenshot - Service slug variable](./images/setup-metabase/service_slug_default_value.png)

   * Edit Dashboard > \['Team slug' or 'Service slug'\] > Default Value > Enter > Done > Save*

   * This variable ensures that the dashboard is looking at analytics and statistics for the correct flow.

3. You should now see the chart update, and the variables in the top left match the slugs for the new team's flow.
![Screenshot - Default values are being filtered for](./images/setup-metabase/default_values_filtered.png)

4. Enable sharing by turning the 'Public' link on.

![Screenshot - Enable sharing](./images/setup-metabase/enable_sharing.png)
![Screenshot - Share Dashboard link with team by turning 'Public' link on.](./images/setup-metabase/share_with_team.png)

5. Add the dashboard, private and public links to the OSL internal 'Analytics overview' Notion page (PlanX > Analytics overview).

### Adding a public link to the editor

1. Log into Hasura `hasura.editor.planx.uk/console` with Cloudflare WARP on. 

2. Get the flow ID from the editor (with the service open in the editor, view the console: the ID is the code that follows `connecting to...`)

3. In Hasura, go to `public` → `flows` -> `Add` a filter -> `id equals flow ID` -> `Run query` (double check it's the correct flow you've selected). With the selected flow, click on the 'edit' icon. 
![Screenshot - Edit the selected flow in Hasura](./images/setup-metabase/edit_flow_in_hasura.png)

4. Add the public Metabase link generated above to the `analytics_link` field and click save. 
![Screenshot - Add the public Metabase dashboard link](./images.setup-metabase/update_analytics_link.png)

The dashboard should now be linked from the editor and the analytics icon should no longer be greyed out. 

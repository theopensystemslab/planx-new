# How to migrate an existing flow to a template

## Context 🖼️
For many years, we had two ways to create new flows: from scratch and by copying an existing flow. A copy is a one-off snapshot.

In summer 2025, we introduced a third way: from template. Creating a templated flow from a source template allows the templated flow to manage it's own controlled "customisations", while still receiving updates whenever the source template is published.

This was straightforward to introduce for _new_ flows, but many common services like FOI and LDCs have long been copied from the "Templates" team (a placeholder that existed for years before the full-fledged feature). 

So, from the earliest design planning of templates, we knew we'd need a plan to migrate existing "pseudo-templated flows" (aka copies) into the new functionality of templated flow features, without disrupting their online published versions or artifacts like submissions, analytics, and feedback.

Migration details and a by-team, by-flow Googlesheet are found here: https://trello.com/c/sVWLCGjV/3369-templates-migration

## Process ⚙️

1. Determine if an existing flow is a candidate for migration:
    - Does it have a "source template" available?
    - Is it already online ("accepting responses") and have asssociated artifacts like analytics, feedback, or submissions? 
    - If it is offline, or online but with no artifacts, consider "archiving and starting new from template" instead of migrating.

2. For a flow suitable for migration:
    - Nullify `flows.copied_from`
    - Populate `flows.templated_from` with the `id` of the source template `flow`
    - Overwrite `flows.data` (**depends on customisation preference)
      - If manually updating customistations, overwrite `flows.data` with the `data` of the source template `flow`
      - If copying customisations from a "test" templated flow, overwrite `flows.data` with the `data` of the test templated `flow`


3. At this point, the flow now appears as a templated flow to editors. Analytics, feedback, submissions, and other flow-level settings will be the same as before. The "Customise" sidebar will now display and all customisations will be incomplete; it will not be possible to publish until customisations are completed. The published version _has not been_ impacted by the migration process, as only council editors should publish their flows (never developers on their behalf).

4. For some migrations, the content team may take over at this step and manually complete the outstanding customisations on the council's behalf (using staging as a comparison if same-day). They can "check for changes to publish" to confirm all validation checks pass, then flag to council service owners to review and publish. 

5. Alternatively, if the council editors have been advised to "start a new template" for testing-only prior to the migration, then we can additionally find the `templated_flow_edits` record for their "test" templated flow, and copy its' contents into a NEW `templated_flow_edits` record for the existing `flows.id`. Once inserted, the customisations should appear "complete" in the editor, with all nodes updated the same as the test flow. 
    - Once they've reviewed and published their migraiton, council editors should be instructed to "archive" their "test" templated flow to both reduce future confusion and ensure that source template aren't unnecessarily pushing out duplicate updates on every publish.

6. Bonus! A member of the content team should "Add a comment" to the "History" of the migrated flow with a simple note like "Migrated to template" to capture the migration date and signify that updates to the source template will appear in History from this point forwards, but not before.

**Note that this migration process only applies to _templated flows_. We've conciously chosen not to programmatically migrate existing flows to _source templates_. Instead, the content teams is building each source template fresh (in parallel) and using it as an opportunity to review and optimise content and graph structure through the process.

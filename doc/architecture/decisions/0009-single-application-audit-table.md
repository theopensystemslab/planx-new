# 9. Single application audit table

Date: 2024-11-20

## Status

Accepted

## Context

We currently maintain separate audit tables (`bops_applications`, `uniform_applications`, and `s3_applications`) for each integration partner's submissions. 

These tables:
- Have largely similar structures and track fundamentally the same type of data
- Create maintenance overhead as changes need to be replicated across multiple tables
- Make cross-integration querying more complex (we have the `submissions_services_log` and `submissions_services_summary` views)
- Results in more unique code per-integration
- It's likely the number of integrations will grow as PlanX matures and grows

## Decision

We propose to consolidate all integration application audit tables into a single `submissions` table with the following key changes:

1. Replace integration-specific ID columns with a standardised `external_reference_id` column (TEXT)
   - This will store the identifier returned by the integration partner
   - `TEXT` is fine as we don't use the columns for foreign keys internally

2. Add an `integration_name` column (ENUM) to identify the destination

3. Use a foreign key relationship between `lowcal_session.id` and `submissions.session_id`
  - As `submission` need to be retained, and `lowcal_session` deleted a constraint such as `ON DELETE SET NULL` for the foreign key would allow for the relationship to be maintained whilst the session record exists.

4. When submitting, the current `check<SEND_DESTINATION>AuditTable()` function will validate the following - 
  - Is there a record for this combination of session ID and send destination, where the `destination_reference` is set to `NULL`
  - If yes, this has not yet been successfully submitted, proceed
  - If no, return early - this session has been submitted already

1. Implement the migration in phases:
   - Create new consolidated table
   - For each integration:
     - Update application code to write to both old and new tables
     - Migrate historical data
     - Update `submissions_services_log` and `submissions_services_summary` view
     - Delete or archive old table

2. Update data retention operations to sanitise new `submissions` table

## Consequences

### Positive

1. Simplified data structure
   - Single source of truth for application audit data
   - Schema changes and permissions only need to be applied once
   - Easier to ensure consistency across new and existing integrations

2. Improved querying capabilities
   - Cross-integration reporting becomes simpler
   - Simplified analytics queries in Metabase

3. Potential future workflow improvements
   - This would enable event-driven architecture via status transitions - the front end could insert a new record with `status = "new"`, which would trigger the `/send` API  endpoint
   - This would eliminate the need for manual Hasura event generation, and simplify our submission process
   - Any changes here are outside the scope of this ADR and will changes will constitute a new propsal, in their own time

### Negative

1. Migration complexity
   - Need to maintain dual writes during transition
   - Requires careful validation of migrated data

2. Current use of existing `submission_` views
   - Frontend code and models may need to be updated
   - Metabase queries may need to be updated
   - We can mitigate this by planning to keep the existing structure of the views, but simplify their sources to read from a single `submissions` table instead of multiple `x_applications` tables

### Questions

1. Timing - is this worth doing right now?
   - Probably! Very open to comments here
   - The number of integrations is likely to grow
   - Earlier consolidation means less data to migrate
   - Enables workflow improvements and simplification for submissions
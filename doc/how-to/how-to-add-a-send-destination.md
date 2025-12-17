# How to Add a Send Destination (Integration)

This guide outlines the steps required to add a new integration destination to PlanX.

## Setup
1. **Configure send destination**
   - Add new destination to `SEND_DESTINATIONS` const in `planx-core`

## Frontend
1. **Update Editor component**
   - Add new destination label and checkbox in Editor component
   - Location: `apps/editor.planx.uk/src/@planx/components/Send/Editor.tsx`
   - Follow existing pattern for label text and styling in `options` object

1. **Implement validation rules**
   - Add any destination-specific validation in Editor component
   - Consider:
     - Which team is sending this?
     - Which services are able to submit to this destination?

## Secret management
1. **Configure integration secrets**
   - Add required secrets to `team_integrations` table
   - Update `planx-core` to read new columns (`TeamClient.getIntegrations()`)

## API
1. **Create send events**
The frontend "Send" components generates a `CombinedEventsPayload` object, this needs to be parsed in the `CreateSendEventsController` to generate a Hasura event. This in turn will hit the API endpoint which parses the session into the required payload for submission.
 
 - Parse the incoming request
 - Generate a Hasura scheduled event for the new send destination

1. **Create payment send events**
Submission can also be driven by an invite to pay event (not triggered by an applicant directly hitting the public "Send" component). We need to ensure that this event can generate a submission event for the new destination.

 - Parse `CombinedResponse` in `createPaymentSendEvents()` (location: `apps/api.planx.uk/modules/pay/service/inviteToPay/createPaymentSendEvents.ts`)
 - Generate a Hasura scheduled event for the new send destination

2. **Add API Routes**
   - Create new route:
    ```typescript
    router.post(
      "/new-destination/{localAuthority}",  
      useHasuraAuth,
      validate(sendIntegrationSchema),
      sendToNewDestinationController
    );
    ```
   - Implement controller with:
     - Team integration validation (check previous validation rules configured in Editor)
     - Submission handling (parse session, authenticate with send destination, construct payload for submission)
     - Audit record creation (write to `new_destination_applications` table)
   - Add `service.ts` layer for business logic
   - Update `docs.yaml` Swagger file

> [!NOTE]
> At this point the new send destination integration can be tested, developed, and iterated on. The steps below should be completed before considering the integration complete and ready for production.


## Metabase
1. **Check Metabase**
   - Check any queries which rely on `submission_services_summary`
   - You may need to rescan the table for new columns to be picked up

## Data sanitation
1. **Update sanitation job**
   - Add table to sanitation cron job
   - Location: `apps/api.planx.uk/modules/webhooks/service/sanitiseApplicationData/operations.ts`
   - Implement specific sanitation rules if needed
   - Test sanitation works as expected

## Database (Hasura)
1. **Create audit table**
   - Name format: `new_destination_applications`
   - Grant necessary Hasura permissions (copy for `bops_applications`)

1. **Update views**
   - Update `submission_services_log` view

```sql
-- Generate display name
CREATE OR REPLACE VIEW "public"."submission_services_log" AS 
   ...
   CASE
      -- Event display names
      WHEN ((se.webhook_conf)::text ~~ '%my-new-destination%'::text) THEN 'Submit to My New Destination'::text
      ...
   END AS event_type,
   ...
```

```sql
-- Add to allow list of events
CREATE OR REPLACE VIEW "public"."submission_services_log" AS 
   ...
   WHERE seil.created_at >= '2024-01-01 00:00:00+00'::timestamp with time zone
   AND (
      -- Allow listed events
      (se.webhook_conf)::text ~~ '%my-new-destination%'::text OR
      ...
   )
   ...
```
   - Update `submission_services_summary` view
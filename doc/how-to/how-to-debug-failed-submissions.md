# How to debug failed submissions

This guide will explain how to troubleshoot failed application submissions. 

If a live application submission fails it is important to  investigate this urgently, and aim for same-day re-submission if possible. Luckily this doesn't happen very often! 

More information on how to re-submit applications can be found in [./how-to-resubmit-an-application.md](./how-to-resubmit-an-application.md).

## Finding out that a submission has failed

### Via `#planx-errors`

Normally we find out that a submission has failed through a notification in the `#planx-errors` Slack channel, and these are usually easy to spot as they are longer than the normal errors. 

They also start with `Error: Sending to <backend> failed`.

E.g.

```json
> New production error in planx (error severity)
>
Error: Sending to BOPS v2 failed (southwark - a-5e5510n-1d-a-535510n1d): Error: Invalid DigitalPlanning payload for session a-5e5510n-1d-a-535510n1d. Errors: [   {     "instancePath": "/data/applicant/ownership/owners/0",     "schemaPath": "#/required",     "keyword": "required",     "params": {       "missingProperty": "noticeGiven"     },     "message": "must have required property 'noticeGiven'"   },   {     "instancePath": "/data/applicant/ownership/owners/0",     "schemaPath": "#/required",     "keyword": "required",     "params": {       "missingProperty": "noNoticeReason"     },     "message": "must have required property 'noNoticeReason'"   },   {     "instancePath": "/data/applicant/ownership/ow… 
> Show more
> Occurred in file:///api/dist/modules/send/bops/bops.js:98

```

### Via `#planx-notifications`

There are normally three notifications per Lawful Development Certificate (LDC) submission in the `#planx-notifications` Slack channel, so a tell-tale sign of an error is if there are fewer messages. 

For example, along with the production error above, for this submission there were only these two messages (the BOPS submission was missing):

```
6:02PM New GOV Pay payment  cj14av1r8hd8vdqp5e2tn5gto1 with status success [southwark]
6:03PM New Uniform submission a-5e5510n-1d-a-535510n1d [Southwark]
```

When we successfully re-submitted the application, we got this third notification:

```
11:06AM New BOPS submission 24-00242-LDCP [https://southwark.bops.services/api/v2/planning_applications]
```

### Feedback from users

Ideally we never want to get in the situation where an end-user notices the error before we do. But we may be informed about a failed submission via Slack channels shared with Local Planning Authorities (LPAs), such as the Open Digital Planning (ODP) Slack workspace.

## Investigating the error

We have several admin API endpoints that exist to help debug submission issues. These can be viewed in the [Swagger docs](https://api.editor.planx.uk/docs/#/admin).

If it is not obvious from the error notification, you can follow these steps to investigate further:

#### Inspect the whole error message

1. Get the `sessionId` from the error notification.
2. In a browser, hit `api.editor.planx.uk/admin/session/{sessions-id}/digital-planning-application`. This should output the full error message.

#### Inspect the erroring payload
3. To get the schema payload that caused this error, add a `skipValidation` query param to the `digital-planning-application` URL, i.e.`?skipValidation=true`

#### Compare the payload with the schema
1. There are useful online tools which can help find the validation issue, such as `json-schema.app`. 
2. Load the current schema URL (e.g. `https://theopensystemslab.github.io/digital-planning-data-schemas/v0.7.1/schemas/application.json` ), and you can compare the erroring payload directly with the schema via the window on the right in the same tool. 

> [!TIP]
> The schema URL can be found at the bottom of the payload:
>
> `{ ..."schema":  "https://theopensystemslab.github.io/digital-planning-data-schemas/v0.7.1/schemas/application.json" }`

#### Read the code
1. The flow passport is mapped to the schema in this file: https://github.com/theopensystemslab/planx-core/blob/005ef823e68eaf9f7d7d5a2c793a6a729e0b6475/src/export/digitalPlanning/model.ts

#### Inspect the Hasura record for the submission
1. Use the admin `/summary` endpoint. This will output the hasura record for the submission, including the entire passport.

#### Go through the flow that the submission came from 
1. Trace the journey that the user took based on their passport variables, and find out if/where there is a mismatch between content and schema.

> [!TIP]
> It might be useful to toggle the data fields for the flow to help match the passport answers with the questions.

> [!WARNING]
> Note that the published flow that the applicant used might be different from the current version of the editor flow!

## Fixing the payload

If the solution involves fixing the submission payload before resubmitting, you can do this as follows: 

1. Go to the production hasura console and filter the `lowcal_sessions` table with the `session_id`. 
2. Make a copy of the contents of the `data` field (it is a good idea to store this temporarily in your code editor in case multiple changes are needed).
3. Fix the payload (e.g. this might mean inserting a new key-value pair in the JSON) and validate the payload with a tool like [jsonlint.com](jsonlint.com).
4. Replace the data field in Hasura with the corrected and validated payload.
5. Save the data, then rerun the admin endpoints from earlier (without the `skipValidation` param) to check that there are no longer any errors.
6. If all is good, resubmit the application - follow the instructions in [./how-to-resubmit-an-application.md](./how-to-resubmit-an-application.md).

> [!CAUTION]
> Production data should only be edited when pairing with another OSL developer!

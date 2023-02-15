# How to re-submit an application to BoPS or Uniform
This guide will explain how to manually re-submit a PlanX application which has not been successfully processed. 

Most commonly, we re-submit cases that have at least one previous submission (which was triggered normally during the applicant journey). In very rare cases, a council may request re-submission because they have received a Gov Payment which is not connected to any attempted submissions.

An application may fail to be submitted to a single destination, or to multiple destinations. This guide will explain how both BoPS and Uniform re-submissions are handled. 

## Process if the submission has been previously attempted, but failed

We will re-create the "send" event generated in Hasura which dispatches a payload to our Express API. There is not currently a way to simply retry an event trigger manually in Hasura.

In the near future, this process should be replaced by a re-submission API which would automate this process.

1. Identify which application has failed. You can get this feedback from partners or the `#planx-notifications` Slack channel. You will need the following information to proceed -  
   * Session ID
   * Destination (Uniform / BoPS)
   * Local authority (Wycombe / Lambeth etc)

2. Identify the cause of the failure. Uniform logs, or a response from BoPS can prove helpful here. 

3. Get the payload data. This can be found in the `payload` column of the `uniform_applications` or `bops_applications` tables. Keep a copy of this JSON for later steps.

4. If relevant, fix the problem with the payload or the API (e.g. malformed XML, missing values) before proceeding with a re-submission.

5. Update existing audit table to allow re-submission (necessary because send endpoints have a built-in check to avoid unintentional duplications).
   * `uniform_applications.response.submissionStatus` should be changed from `"PENDING"` to `"FAILED"`
   * `bops_application.response.message` should be changed from `"Application created"` to `"FAILED"`
 
6. In Insomnia (or HTTP client of choice), prepare to re-submit the payload - 
   * API Endpoint - `https://api.editor.planx.uk/${destination}/${localAuthority}`
      * For example, https://api.editor.planx.uk/uniform/aylesbury-vale
   * HTTP Method - POST
   * Headers - `{ "Authorization": ${HASURA_PLANX_API_KEY} }`
     * This secret can be found via Pulumi or your `.env` file
  
> ⚠️ *Uniform instances do not neatly map to local authorities. Please take care to ensure that the value for `localAuthority` is taken from `uniform_applications.destination` when re-submitting to Uniform*

7. Prepare the payload copied from Step 3. Ensure the structure is correct, see example - 

```json
{
  "payload: {
    ** PAYLOAD_JSON **
  }
}
```

8. Send! ✉️

9. Check response message from BoPS / Uniform to confirm success or failure. Rectify any issues if possible (e.g. malfored payload)

10. Notify partners on `#planx-notifications` channel of the re-submissions

## Process if the application has been paid for, but there are no submission attempts recorded

We will verify that the payment is valid, manually record the payment information in the session data, and "resume" the application to complete the submission.

#### Confirm this session _should be_ submitted:

1. Identify which application has failed. You can get this feedback from partners or the `#planx-notifications` Slack channel. You will need the following information to proceed - 
  * Payment reference from Gov.UK Pay
  * Session ID (you may need to infer this from the timestamp, local authority, and email of the payment reference)

2. Find the associated `lowcal_sessions` & `payment_status` records. Confirm that `lowcal_sessions.submitted_at` is NULL and that there are not records for this session ID in BOPS or Uniform application tables yet. 

3. Query Gov Pay REST API to get status to check it was successful; confirm that the most recent status returned directly by Gov Pay API matches our latest audit record in `payment_status`
  * Endpoint = https://publicapi.payments.service.gov.uk/v1/payments/<PAYMENT_ID>
  * Method = GET
  * Auth is required via a Bearer Token. You can get this from Pulumi with pulumi config get gov-uk-pay-token-<LOCAL_AUTHORITY>

#### Proceed with the submission

1. Copy `lowcal_sessions.data` and paste it into something like https://jsonlint.com/; we need to edit the passport & breadcrumbs to reflect a payment if it doesn't already:
  * in the passport, add one object variable: ```{ "application.fee.reference.govPay" : { "amount": <fee>, "payment_id": "<payment-reference>" }}```
      * fee should match existing variable `"application.fee.payable"` & payment reference comes from prior steps
  * in the breadcrumbs, add an entry for the Pay node (find the correct id by opening that node in its' respective flow): eg ```"R72aEBuc3F": { "auto": true }```,
  * add a top-level key ```"govUkPayment": { "state": { "status": "created" }}``` to skip the "resume" page during reconciliation

2. Confirm your altered `lowcal_sessions.data` JSON is valid; update the `lowcal_sessions.data` record and save

3. Construct a magic link to "resume" the session using the `lowcal_sessions.id` and `lowcal_sessions.email`, wait for the Confirmation page.

4. Check response message from BoPS / Uniform to confirm success or failure. If failure, follow steps in first resubmission scenario above.

5. Notify partners on `#planx-notifications` channel of the submissions. An applicant will automatically receive an email from BOPS on successful submission.

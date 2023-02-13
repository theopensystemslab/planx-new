# How to re-submit an application to BoPS or Uniform
This guide will explain how to manually re-submit a PlanX application which has not been successfully processed. 

An application may fail to be submitted to a single destination, or to multiple destinations. This guide will explain how both BoPS and Uniform re-submissions are handled. We will re-create the "send" event generated in Hasura which dispatches a payload to our Express API. There is not currently a way to simply retry an event trigger manually in Hasura.

In the near future, this process should be replaced by a re-submission API which would automate this process.


## Process
1. Identify which application has failed. You can get this feedback from partners or the `#planx-notifications` Slack channel. You will need the following information to proceed -  
   * Session ID
   * Destination (Uniform / BoPS)
   * Local authority (Wycombe / Lambeth etc)

2. Identify the cause of the failure. Uniform logs, or a response from BoPS can prove helpful here. 

3. If relevant, fix the problem with the payload or the API (e.g. malformed XML, missing values) before proceeding with a re-submission.

4. Get the payload data. This can be found in the `payload` column of the `uniform_applications` or `bops_applications` tables. Keep a copy of this JSON for later steps.

5. Update existing audit table to allow re-submission.
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

9. Check response message from BoPS / Unifrom to confirm success or failure. Rectify any issues if possible (e.g. malfored payload)

10. Notify partners on `#planx-notifications` channel of the re-submissions
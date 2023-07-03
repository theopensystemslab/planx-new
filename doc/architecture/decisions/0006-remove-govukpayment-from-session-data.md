# 6. Remove `GovUkPayment` from session data

Date: 2023-07-03

## Status

Proposed

## Context

Currently, we store the `GovUkPayment` object alongside the session data in the `lowcal_storage.data` column. This is largely done for convenience - it allows us to easily find out the payment status of a session. With recent changes to the structure of breadcrumbs, it makes sense to re-evaluate how this data is stored and referred to.

## Decision

We should not store the `GovUkPayment` object, but look up the status of a session in one of the two following ways when required - 
 - Directly via the GovPay API
 - Via our `payment_status` audit table which can be joined to a session

This object can then be stored temporarily in the application's memory during the user's active session (Zustand store).

## Consequences

### Required code changes
We will need to make a series of changes to how we currently interact with this object, listed below - 

| Interaction | Context | Required change | Consequence |
|--|--|--|--|
| Pay component | `GovUkPayment` is required here to get status and `next_url` links | On component load, fetch GovPay ID via audit table and query GovPay API. This could be wrapped in a `planx-core` function `session.getGovUkPayment(sessionId)`. <br/><br/> We would need to handle Hasura permissions here to ensure a public user can access `payment_status.gov_pay_id` for their session ([Hasura docs](https://hasura.io/docs/latest/auth/authorization/permissions/row-level-permissions/#relationships-in-permissions)) | Increased load time on pay component for additional queries |
| Reconciliation | If a session is paid, we skip reconciliation | Query `payment_status` table | None |
| Submission to BOPS & Uniform | We get the "paid" amount and "reference" (id) from the session data | Query `payment_status` table. <br/><br/> We should add a `payment_amount` column to this table. | None - asynchronous action |
| Payment requests - creating | We check the payment status when generating a payment request | Query `payment_status` table  |  None |
| Payment requests - paying | We update `lowcal_session.data.govUkPayment` when a payment request is paid by a nominee |  Query `payment_status` table. <br/><br/> Do not mutate session data when a payment request is paid. | None |

### Reliability
As noted above, there would be no additional calls to the GovPay APIs. This means that should their services be affected, the material impact on PlanX services would be the same as it is today - the pay component and payment requests would not work, but other APIs (submission, reconciliation etc) would be unaffected.

### Data retention
There would be impact to our data retention policies - session data, payment requests, and the payment audit table are already accounted for.

The GovPay docs do not indicate that there is a time period for which they hold payment information - suggesting that API requests can be made for all historic payments. Even if this were not the case, as session data (our current `GovUkPayment` source) is sanitised according to our data retention policy we would not lose access to data if there are longer term retention limits in place through their API.
# An ITP is fulfilled server-side - setting `paid_at` triggers submission to the LPA
#
# We have two (racing) methods to fulfil the order
#  - The checkout.session.completed webhook
#  - The payer page (nominee returns from Stripe)
# 
# We need to ensure we only submit once, despite the two submission methods always firing
#
# Docs: https://docs.stripe.com/checkout/fulfillment
# Ref: https://github.com/theopensystemslab/planx-new/pull/7728

@stripe
Feature: Stripe invite to pay

  Background:
    Given a team on Stripe with a connected account
    And an invite to pay session with "a statutory fee"

  Scenario: The webhook fulfils the payment request, even if the nominee never returns to PlanX
    When the applicant invites a nominee to pay
    And the nominee pays via Stripe Checkout, then closes their browser without returning to PlanX
    Then the webhook marks the payment request as paid
    And the session records the payment reference
    And the application is scheduled for submission to the council

  Scenario: The nominee's payment is split between PlanX and the council
    When the applicant invites a nominee to pay
    And the nominee pays via Stripe Checkout
    Then the payment is a destination charge to the council's connected account
    And the nominee is charged 30600 pence
    And PlanX keeps 4800 pence as the application fee
    And the payment has "paidViaInviteToPay" metadata of "true"
    And the payment is linked to the payment request

  Scenario: Returning to PlanX after the webhook has marked the payment request as paid does not submit the application again
    When the applicant invites a nominee to pay
    And the nominee pays via Stripe Checkout
    And the webhook marks the payment request as paid
    And the nominee returns to PlanX from Stripe Checkout
    Then the payer page is told the payment request is paid
    And the paid date and payment reference are unchanged
    And the application is only scheduled for submission once

  Scenario: Returning to PlanX before the webhook arrives only submits the application once
    When the applicant invites a nominee to pay
    And the nominee pays via Stripe Checkout
    And the nominee returns to PlanX from Stripe Checkout, without waiting for the webhook
    Then the payer page is told the payment request is paid
    And the payment request is marked as paid
    And the session records the payment reference
    And the application is only scheduled for submission once

  Scenario: The payer page can't mark a payment request as paid using another payment's Checkout Session
    Given the applicant has started paying via Stripe Checkout
    When the applicant invites a nominee to pay
    And the nominee returns to PlanX with the applicant's Checkout Session instead of their own
    Then the request is refused with a 400 error: "does not belong to payment request"
    And the payment request is not paid

  Scenario: Inviting a nominee expires the applicant's open Checkout Session
    Given the applicant has started paying via Stripe Checkout
    When the applicant invites a nominee to pay
    Then the applicant's Checkout Session is expired

  Scenario: The applicant can't pay once a nominee has been invited
    When the applicant invites a nominee to pay
    And the applicant tries to pay via Stripe Checkout
    Then the request is refused with a 409 error: "Cannot initialise a new payment for locked session"

  Scenario Outline: The nominee can't pay a payment request which <state>
    When the applicant invites a nominee to pay
    And the payment request <state>
    And the nominee tries to pay via Stripe Checkout
    Then the request is refused with a <status> error: "<reason>"

    Examples:
      | state                            | status | reason                      |
      | has already been paid            | 409    | has already been paid       |
      | has expired                      | 410    | has expired                 |
      | has started a GOV.UK Pay payment | 409    | must be paid via GOV.UK Pay |

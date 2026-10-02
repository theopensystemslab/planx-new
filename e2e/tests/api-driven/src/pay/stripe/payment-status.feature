@stripe
Feature: Stripe payment status audit trail

  Background:
    Given a team on Stripe with a connected account
    And a session with "a statutory fee"

  Scenario: A successful payment is recorded
    When the applicant pays via Stripe Checkout
    Then an "initiated" payment status is recorded against the Checkout Session
    And a "created" payment status is recorded
    And a "succeeded" payment status is recorded
    And the succeeded payment status records the amount, fee breakdown and metadata

  Scenario: A declined payment is recorded, but not as succeeded
    When the applicant pays via Stripe Checkout with a declined card
    Then an "initiated" payment status is recorded against the Checkout Session
    And a "created" payment status is recorded
    And a "payment_failed" payment status is recorded
    And no "succeeded" payment status is recorded

  Scenario: A declined payment can be retried
    When the applicant pays via Stripe Checkout with a declined card
    Then an "initiated" payment status is recorded against the Checkout Session
    When the applicant retries with a valid card
    Then a "payment_failed" payment status is recorded
    And a "succeeded" payment status is recorded

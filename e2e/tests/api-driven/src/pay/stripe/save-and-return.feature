@stripe
Feature: Stripe save and return

  Background:
    Given a team on Stripe with a connected account
    And a session with "a statutory fee"

  Scenario: Returning before paying reconciles the session
    When the applicant returns to their saved session
    Then the session is reconciled with no content changes

  Scenario: Returning after starting a payment skips reconciliation
    When the applicant pays via Stripe Checkout with a declined card
    And a "created" payment status is recorded
    And the applicant returns to their saved session
    Then reconciliation is skipped as a payment has started

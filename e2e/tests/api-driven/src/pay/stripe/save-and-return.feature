@stripe
Feature: Stripe save and return

  Background:
    Given a team on Stripe with a connected account
    And a session with "a statutory fee"

  Scenario: Returning before paying reconciles the session
    When the applicant returns to their saved session
    Then the session is reconciled with no content changes

  Scenario: Returning after leaving Stripe Checkout without paying skips reconciliation
    When the applicant leaves Stripe Checkout without paying
    And the applicant returns to their saved session
    Then reconciliation is skipped as a payment has started

  Scenario: Returning after a declined payment skips reconciliation
    When the applicant pays via Stripe Checkout with a declined card
    And the applicant returns to their saved session
    Then reconciliation is skipped as a payment has started

@stripe
Feature: Stripe payment metadata

  Background:
    Given a team on Stripe with a connected account

  Scenario: Metadata is recorded on the payment, and copied to the council's payment
    Given a session with "a statutory fee"
    When the applicant pays via Stripe Checkout
    Then the payment records the Pay component's metadata and the PlanX session
    And the council's payment has the same metadata

  Scenario Outline: Pay component metadata is read from the session for <fee>
    Given a session with "<fee>"
    And the Pay component has metadata:
      | key      | value                       | type   |
      | VAT      | application.fee.payable.VAT | data   |
      | CostCode | PLN-123                     | static |
    When the applicant pays via Stripe Checkout
    Then the payment has "VAT" metadata of "<vat>"
    And the payment has "CostCode" metadata of "PLN-123"
    And the council's payment has the same metadata

    Examples:
      | fee                 | vat |
      | a statutory fee     | 8   |
      | a Fast Track fee    | 38  |
      | a discretionary fee | 108 |

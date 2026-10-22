Feature: Stripe invite to pay submissions

  @regression @stripe-invite-to-pay-submissions
  Scenario Outline: A paid invite is submitted to <DESTINATION>
    Given an invite to pay session on Stripe where "<DESTINATION>" is a send destination
    When the applicant invites a nominee to pay
    And the nominee pays via Stripe Checkout
    Then there should be an audit entry for a successful "<DESTINATION>" submission
    And the session's `submitted_at` date should be set
    Examples:
      | DESTINATION |
      | Email       |
      | Uniform     |
      | BOPS        |

Feature: Invite to Pay Submissions

  Scenario: Modified `paid_at` on sessions with a valid payment request
    Given a session with a payment request for an invite to pay flow where "<DESTINATION>" is a send destination
    When the payment request's `paid_at` date is set
    Then there should be an audit entry for a successful "<DESTINATION>" submission
    And the session's `submitted_at` date should be set
    Examples:
      | DESTINATION  |
      | Email        |
      | Uniform      |
      | BOPS         |

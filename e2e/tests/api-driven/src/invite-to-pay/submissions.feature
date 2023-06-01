Feature: Invite to Pay Submissions

  Scenario: Modified `paid_at` on sessions with a valid payment request
    Given a session with a payment request for an invite to pay flow where "<DESTINATION>" is a send destination
    When the payment request's `paid_at` date is set
    Then there should be an entry in the "<AUDIT_TABLE>" table for a successful "<DESTINATION>" submission
    Examples:
      | DESTINATION  | AUDIT_TABLE           |
      | BOPS         | bops_applications     |
      | Email        | email_applications    |
      #| Uniform      | uniform_applications  |

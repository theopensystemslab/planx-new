Feature: Send welcome email

  @send-welcome-email
  Scenario: Unauthenticated request is rejected
    When a welcome email request is made without authentication
    Then the response status is 401

  @send-welcome-email
  Scenario: Valid request sends email via Resend
    When a welcome email request is made with valid authentication and payload
    Then the response status is 200
    And the response message indicates the email was sent successfully

  @send-welcome-email
  Scenario: Demo team user is excluded
    When a welcome email request is made for a Demo team user
    Then the response status is 200
    And the response message indicates the email was skipped for Demo team

  @send-welcome-email
  Scenario: Invalid payload is rejected
    When a welcome email request is made with an invalid payload
    Then the response status is 400

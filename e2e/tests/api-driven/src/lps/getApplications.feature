Feature: Magic link validation and expiration for localplanning.services

  @regression @lps-magic-links
  Scenario Outline: Fetching applications with an invalid token
    Given a magic link is generated
    When an invalid token is provided
    Then applications can't be accessed

  @regression @lps-magic-links
  Scenario Outline: Fetching applications with an invalid email address
    Given a magic link is generated
    When an invalid email address is provided
    Then applications can't be accessed

  @regression @lps-magic-links
  Scenario Outline: Fetching applications with an expired token
    Given a magic link is generated
    When the expiry time has passed
    Then applications can't be accessed

  @regression @lps-magic-links
  Scenario Outline: Fetching applications successfully
    Given a magic link is generated
    When the correct details are provided
    Then applications can be accessed

  @regression @lps-magic-links
  Scenario Outline: Fetching applications a single time per-link
    Given a magic link is generated
    When the correct details are provided
    Then the link cannot be reused
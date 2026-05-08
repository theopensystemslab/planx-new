Feature: Team member limits

  @regression @max-team-members-20
  Scenario: Cannot add user when team has 20 active members
    When user tries to add a member to a team with the maximum number of users
    Then the response is a GraphQL error

  @regression @max-team-members-19-plus-archived
  Scenario: Can add user when team has 19 active and 2 archived members
    When user tries to add a member to a team with 19 active members
    Then the user is successfully added
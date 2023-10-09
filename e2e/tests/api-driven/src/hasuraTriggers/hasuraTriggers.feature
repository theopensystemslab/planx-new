Feature: Database triggers

  @regression @add-user-trigger
  Scenario: Adding a user to Planx - with Templates team
    Given the Templates team exists
    When a new user is added
    Then they are granted access to the Templates team
    And have the teamEditor role

  @regression @add-user-trigger
  Scenario: Adding a user to Planx - without Templates team
    When a new user is added
    Then they are not granted access to the Templates team
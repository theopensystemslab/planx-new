Feature: Trial Team access

  Background:
    Given there is a trial team and standard team:
      | id | name     | slug      | is_trial_team |
      | 1  | Trial    | trial     | true          |
      | 3  | Standard | standard  | false         |

    And there is one trial user and one standard user:
      | id | first_name     | last_name | email                |
      | 12 | Trial          | User      | trial.user@email.com |
      | 32 | Standard       | User      | standard.user@email.com  |
    And these users are assigned to their respective teams:
      | user_id | team_id | role       |
      | 12      | 1       | teamEditor |
      | 32      | 3       | teamEditor |        
    And I have two flows in the database for trial access and standard access:
      | creator_id  | name                  | slug              | team_id |
      | 12          | Trial Flow            | trial-flow        | 1       |
      | 32          | Standard Flow         | standard-flow     | 3       |

  @trial-user-permissions
  Scenario: I can turn a flow online with full access
    When a flow has been created by a user from a team with standard access
    Then I should be able to update the status

  @trial-user-permissions
  Scenario: I cannot turn a flow online with trial access
    When a flow has been created by a user from a team with trial access
    Then I should not be able to update the status
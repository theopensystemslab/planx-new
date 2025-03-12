Feature: Trial Team access

  Background:
    Given there is a trial team and full access team:
      | id | name         | slug          | access_rights |
      | 1  | Trial access | trial-access  | trial         |
      | 3  | Full access  | full-access   | full          |

    And there is one trial user and one full user:
      | id | first_name | last_name | email                |
      | 12 | Trial      | User      | trial.user@email.com |
      | 32 | Full       | User      | full.user@email.com  |
    And these users are assigned to their respective teams:
      | user_id | team_id | role       |
      | 12      | 1       | teamEditor |
      | 32      | 3       | teamEditor |        
    And I have two flows in the database for trial access and full access:
      | creator_id  | name              | slug             | team_id |
      | 12          | Trial Flow        | trial-flow       | 1       |
      | 32          | Full Flow         | full-flow        | 3       |

  @trial-user-permissions
  Scenario: I can turn a flow online with full access
    When a flow has been created by a user from a team with full access
    Then I should be able to update the status

  @trial-user-permissions
  Scenario: I cannot turn a flow online with trial access
    When a flow has been created by a user from a team with trial access
    Then I should not be able to update the status
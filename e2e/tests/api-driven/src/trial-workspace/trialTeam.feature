Feature: Trial Team access

  Background:
    Given the following teams exist:
      | id | name        | slug        | access_rights |
      | 1  | Trial team  | trial-team  | trial         |
      | 3  | Full access | full-access | full          |
    And the following users exist:
      | id | first_name | last_name | email                |
      | 12 | Trial      | User      | trial.user@email.com |
      | 32 | Full       | User      | full.user@email.com  |
    And users are members of teams:
      | user_id | team_id | role       |
      | 12      | 1       | teamEditor |
      | 32      | 3       | teamEditor |

  @trial-user-permissions
  Scenario: I can create a flow
    When I am in my own team
    Then I can create a flow

  @trial-user-permissions
  Scenario: I can turn a flow online with full access
    When I am on a flow in my team
    And my team has full access rights
    Then I should be able to update the status

  @trial-user-permissions
  Scenario: I cannot turn a flow online with trial access
    When I am on a flow in my team
    And my team has trial access rights
    Then I should not be able to update the status
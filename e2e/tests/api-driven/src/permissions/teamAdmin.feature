Feature: Testing Permissions for teamAdmin Role

  @regression @team-admin-permissions
  Scenario Outline: teamAdmin permissions
    Given a teamAdmin is a member of a team
    When they perform "<ACTION>" on "<TABLE>"
    Then they have access

    Examples:
      | TABLE   | ACTION          |
      | flows   | insert          |
      | flows   | update          |
      | flows   | delete          |

  @regression @team-admin-permissions
  Scenario Outline: teamAdmin permissions in a different team
    Given a teamAdmin is not in the requested team
    When they perform "<ACTION>" on "<TABLE>"
    Then they do not have access

    Examples:
      | TABLE   | ACTION          |
      | flows   | insert          |
      | flows   | update          |
      | flows   | delete          |
Feature: Testing Permissions for teamAdmin Role

  @regression @team-admin-permissions
  Scenario Outline: teamAdmin permissions
    Given a teamAdmin from team1
    When they perform "<ACTION>" on team1's "<TABLE>"
    Then they have access

    Examples:
      | TABLE           | ACTION          |
      | flows           | insert          |
      | flows           | update          |
      | flows           | delete          |
      | published_flows | insert          |

  @regression @team-admin-permissions
  Scenario Outline: teamAdmin permissions in a different team
    Given a teamAdmin from team2
    When they perform "<ACTION>" on team1's "<TABLE>"
    Then they do not have access

    Examples:
      | TABLE           | ACTION          |
      | flows           | insert          |
      | flows           | update          |
      | flows           | delete          |
      | published_flows | insert          |

  @regression @team-admin-permissions
  Scenario Outline: teamAdmin permissions - querying themselves
    Given a teamAdmin from team1
    When they perform "<ACTION>" on themselves in "<TABLE>"
    Then they have access

    Examples:
      | TABLE           | ACTION          |
      | users           | select          |
      | team_members    | select          |

  @regression @team-admin-permissions
  Scenario Outline: teamAdmin permissions - querying other users
    Given a teamAdmin from team1
    When they perform "<ACTION>" on a different user in "<TABLE>"
    Then they do not have access

    Examples:
      | TABLE           | ACTION          |
      | users           | select          |
      | team_members    | select          |
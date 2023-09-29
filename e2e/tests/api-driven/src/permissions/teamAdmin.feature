Feature: Testing Permissions for teamEditor Role
# Setup - we create two teams, with one teamEditor each

  # Test that teamEditor1 can access team1's resources
  @regression @team-admin-permissions
  Scenario Outline: teamEditor permissions
    Given a teamEditor from team1
    When they perform "<ACTION>" on team1's "<TABLE>"
    Then they have access

    Examples:
      | TABLE           | ACTION          |
      | flows           | insert          |
      | flows           | update          |
      | operations      | insert          |
      | operations      | update          |
      | flows           | delete          |
      | published_flows | insert          |

  # Test that teamEditor2 cannot access team1's resources
  @regression @team-admin-permissions
  Scenario Outline: teamEditor permissions in a different team
    Given a teamEditor from team2
    When they perform "<ACTION>" on team1's "<TABLE>"
    Then they do not have access

    Examples:
      | TABLE           | ACTION          |
      | flows           | insert          |
      | flows           | update          |
      | operations      | insert          |
      | operations      | update          |
      | flows           | delete          |
      | published_flows | insert          |

  # Test that teamEditor1 can access their own records
  @regression @team-admin-permissions
  Scenario Outline: teamEditor permissions - querying themselves
    Given a teamEditor from team1
    When they perform "<ACTION>" on themselves in "<TABLE>"
    Then they have access

    Examples:
      | TABLE           | ACTION          |
      | users           | select          |
      | team_members    | select          |

  # Test that teamEditor1 can access teamEditor2's records
  @regression @team-admin-permissions
  Scenario Outline: teamEditor permissions - querying other users
    Given a teamEditor from team1
    When they perform "<ACTION>" on a different user in "<TABLE>"
    Then they do not have access

    Examples:
      | TABLE           | ACTION          |
      | users           | select          |
      | team_members    | select          |
  Feature: Demo user access
# We create the steps data from these Given statements below
# altering these will alter what data is created for testing
    Background:

        Given I have the following teams in the database:
            | id        | name                      | slug                      |
            | 1         | Open Systems Lab          | open-systems-lab          |
            | 29        | Templates                 | templates                 |
            | 30        | Open Digital Planning     | open-digital-planning     |
            | 32        | Demo                      | demo                      |
            | 45        | Other Team                | other-team                |

        And I have two users in the database: 
            | id        | first_name    | last_name | email                 |
            | 1         | Demo          | User      | demo.user@email.com   |
            | 2         | Nota          | Demo      | nota.demo@email.com   |

        And I have the following flows in the database:
            | creator_id | name             | slug              | team_id |
            | 1          | Demo Flow        | demo-flow         | 32      |
            | 2          | Test OSL         | test-osl          | 1       |
            | 2          | Test Templates   | test-templates    | 29      |
            | 2          | Test ODP         | test-odp          | 30      |
            | 2          | Other Flow       | other-flow        | 45      |
        And I am a demoUser

    @demo-user-permissions
    Scenario: I can only view my own flows
        When I am in the "<TEAM>" team
        Then I should only see my own flows
        But I should not see flows that I have not created
        Examples:
            | TEAM  |
            | demo  |


    @demo-user-permissions
    Scenario Outline: I can only view specific teams
        When I query the teams table
        Then I can access the teams with slug: "<SLUG>"
        But I should not access the Other Team

        Examples:
            | SLUG                      |
            | open-systems-lab          |
            | templates                 |
            | open-digital-planning     |
            | demo                      |

    @demo-user-permissions 
    Scenario Outline: Creating a new flow
        When I insert a flow into the team: "<TEAM>"
        Then I should not succeed
        But I should succeed in the Demo team

        Examples: 
            | TEAM                  | 
            | templates             |
            | open-systems-lab      |
            | open-digital-planning |

    @demo-user-permissions 
    Scenario Outline: Actioning my own flows
        When I am on my own flow
        Then I should be able to "<ACTION>" the flow

        Examples:
            | ACTION    |
            | update    |
            | delete    |

    @demo-user-permissions 
    Scenario Outline: Actioning flows in other teams
        When I am in the "<TEAM>" team
        Then I should be able to see a flow
        But I should not have access to modify the flow

        Examples: 
            | TEAM                  | 
            | templates             |
            | open-systems-lab      |
            | open-digital-planning |

    @demo-user-permissions
    Scenario Outline: Editing team settings
        When I am in the "<TEAM>" team
        Then I should not have access to team settings

        Examples: 
            | TEAM                  | 
            | templates             |
            | open-systems-lab      |
            | open-digital-planning |
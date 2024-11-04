  Feature: Demo user access

    Background:
        Given I am a user with a demoUser role
        And I have two users in the database: 
            | id        | first_name    | last_name | email                 |
            | 1         | Demo          | User      | demo.user@email.com   |
            | 2         | Nota          | Demo      | nota.demo@email.com   |

        And I have the following teams in the database:
            | id        | name                      | slug                      |
            | 1         | Open Systems Lab          | open-systems-lab          |
            | 29        | Templates                 | templates                 |
            | 30        | Open Digital Planning     | open-digital-planning     |
            | 32        | Demo                      | demo                      |
            | 45        | Other Team                | other-team                |

        And I have the following flows in the database:
            | id      | creator_id | name             | team_id   |
            | 1       | 1          | Test Flow 1      | 32        |
            | 2       | 1          | Test Flow 2      | 32        |
            | 3       | 2          | Other Flow       | 45        |

@demo-user-permissions
Scenario: I can only view my own flows
    When I am in the Demo team
    Then I should only see flows with ids "1, 2"
    And I should not see flow with id "3"

    @demo-user-permissions
    Scenario Outline: I can only view specific teams
        When I am on the Teams page
        Then I can only see team with id: "<ID>"

        Examples:
            | ID    |
            | 1     |
            | 29    |
            | 30    |
            | 32    |

    @demo-user-permissions
    Scenario: Creating a new flow in the Demo team
        When I am in the Demo team
        Then I should be able to create a flow

    @demo-user-permissions 
    Scenario Outline: Creating a new flow in other teams
        When I am in the "<TEAM>" team
        Then I should not be able to create a flow

        Examples: 
            | TEAM                  | 
            | templates             |
            | open-systems-lab      |
            | open-digital-planning |

    @demo-user-permissions 
    Scenario Outline: Actioning my own flows
        When I am in the Demo team
        And I am on my own flow
        Then I should be able to "<ACTION>" the flow

        Examples:
            | ACTION    |
            | update    |
            | delete    |

    @demo-user-permissions 
    Scenario Outline: Actioning flows in other teams
        When I am in the "<TEAM>" team
        And I want to edit a flow that I did not create
        Then I should not have access to modify the flow

        Examples: 
            | TEAM                  | 
            | templates             |
            | open-systems-lab      |
            | open-digital-planning |

    @demo-user-permissions
    Scenario: Accessing flow settings
        When I am on my own flow
        Then I should have access to flow settings

    @demo-user-permissions
    Scenario Outline: Editing team settings
        When I am in the "<TEAM>" team
        Then I should not have access to team settings

        Examples: 
            | TEAM                  | 
            | templates             |
            | open-systems-lab      |
            | open-digital-planning |
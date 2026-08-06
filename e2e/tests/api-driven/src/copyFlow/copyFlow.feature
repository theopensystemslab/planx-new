Feature: Copy flow

  @copy-flow
  Scenario: A teamEditor copies a flow, including its notes
    Given a source flow with notes exists
    When the flow is copied into its own team
    Then the copy response status is 200
    And a new flow exists with a copied operation
    And the new flow's notes are copied with remapped node ids and preserved clone relationships

  @copy-flow
  Scenario: A teamEditor copies a flow that belongs to a different team into their own team
    Given a source flow with notes exists
    When a teamEditor copies the flow from a different team into their own team
    Then the copy response status is 200
    And the new flow belongs to the copying teamEditor's own team

  @copy-flow
  Scenario: A teamEditor cannot copy a flow into a team they don't belong to
    Given a source flow with notes exists
    When a teamEditor from a different team tries to copy the flow into that team
    Then the copy response status is 403
    And no new flow was created

  @copy-flow
  Scenario: An unauthenticated request is rejected
    Given a source flow with notes exists
    When an unauthenticated request is made to copy the flow
    Then the copy response status is 401
    And no new flow was created

Feature: Flow status history

  @regression @flow-status-history
  Scenario: Creating a flow
    When a new flow is added
    Then the status of the flow is online by default
    And a flow_status_history record is created

  @regression @flow-status-history
  Scenario: Updating a flow 
    When a new flow is added
    And the flow status is changed to offline
    Then the open flow_status_history record is updated
    And a new flow_status_history record is created
Feature: Flow status history

  @regression @flow-status-history
  Scenario: Creating a flow
    Given a flow exists
    Then the status of the flow is offline by default
    And a flow_status_history record is created

  @regression @flow-status-history
  Scenario: Updating a flow 
    Given a flow exists
    When the flow status is changed to online
    Then the open flow_status_history record is updated
    And a new flow_status_history record is created
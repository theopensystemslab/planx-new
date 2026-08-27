Feature: Search flows

  @search-flows
  Scenario: Ranking name matches above matches split across name and summary, and excluding unrelated flows
    Given a flow named "Apply for planning permission" exists
    And a flow named "Planning enquiries" with summary "Report a permission breach" exists
    And a flow named "Some unrelated information" exists
    When flows are searched for "planning permission"
    Then the flow named "Apply for planning permission" is ranked above the flow named "Planning enquiries"
    And the flow named "Some unrelated information" is not included in the results

  @search-flows
  Scenario: Matching against description, with HTML tags stripped so they don't pollute the match
    Given a flow named "Some unrelated name" with description "<p>Guidance about <strong>lawfulness</strong> certificates</p>" exists
    And a flow named "Some unrelated information" exists
    When flows are searched for "lawfulness"
    Then only the flow named "Some unrelated name" is returned

  @search-flows
  Scenario: Excluding soft-deleted flows even when the name matches
    Given a deleted flow named "Apply for planning permission (deleted)" exists
    When flows are searched for "planning permission"
    Then no results are returned

  @search-flows
  Scenario: Accepting a where filter on top of the ranked results
    Given a flow named "Apply for planning permission" exists
    And a template flow named "Apply for planning permission (template)" exists
    When flows are searched for "planning permission" filtered to templates only
    Then only the flow named "Apply for planning permission (template)" is returned
    When flows are searched for "planning permission" filtered to non-templates only
    Then only the flow named "Apply for planning permission" is returned

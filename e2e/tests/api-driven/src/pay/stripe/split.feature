@stripe
Feature: Stripe Connect split

  Background:
    Given a team on Stripe with a connected account

  Scenario Outline: A payment with <fee> is split between PlanX and the council
    Given a session with "<fee>"
    When the applicant pays via Stripe Checkout
    Then the payment is a destination charge to the council's connected account
    And the applicant is charged <amount> pence
    And PlanX keeps <applicationFee> pence as the application fee

    Examples:
      | fee              | amount | applicationFee |
      | a standard fee   | 30600  | 4800           |
      | a Fast Track fee | 48600  | 4800           |
      | a reduced fee    | 17700  | 4800           |

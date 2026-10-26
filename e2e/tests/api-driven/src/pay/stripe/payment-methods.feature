@stripe
Feature: Stripe payment methods by amount

  Background:
    Given a team on Stripe with a connected account

  Scenario Outline: A total of <total> is offered <methods>
    Given a session with "<fee>"
    When the applicant starts a Stripe Checkout
    Then the Checkout Session offers "<methods>"

    Examples:
      | fee               | total | methods           |
      | a householder fee | £576  | card, pay_by_bank |
      | a fee of £600     | £600  | pay_by_bank       |

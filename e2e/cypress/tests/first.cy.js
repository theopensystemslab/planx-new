// @ts-nocheck
const TEAM_NAME = "test-team";
const USER_EMAIL = "test@test.com";
const SERVICE_NAME = "test-service";

context('Navigation', () => {
  before(() => {
    cy.insertTeam(TEAM_NAME).as('teamId');
    cy.insertTestUser(USER_EMAIL).as('userId');
  });

  after(function () {
    cy.cleanAnalytics();
    cy.deleteUsers([this.userId])
      .then(response => {
        const { errors } = response;
        expect(errors, "Delete users").to.equal(undefined);
      });
    cy.deleteFlowsByTeamIdsAndSlugs([this.teamId], [SERVICE_NAME])
      .then(response => {
        const { errors } = response;
        expect(errors, "Delete flows").to.equal(undefined);
      });
    cy.deleteTeams([this.teamId])
      .then(response => {
        const { errors } = response;
        expect(errors, "Delete teams").to.equal(undefined);
      });
  });

  beforeEach(() => {
    const URL = "http://localhost:3000";
    cy.visit(URL);
  })

  it("creates a flow that is executable", function () {
    // Log in
    cy.get('a').should('have.text', 'Login with Google');
    cy.getJWT(this.userId).then((jwt) => {
      cy.setJWT(jwt);
    });

    // Create a service
    cy.contains('h2', TEAM_NAME).click();

    cy.window().then(($win) => {
      cy.stub($win, 'prompt').returns(SERVICE_NAME);
      cy.contains('button', "Add a new service").click();
    });

    // Add a Question node
    cy.get('li.hanger>a').click();
    const questionText = 'Is this a test?';
    cy.get('[placeholder="Text"]').type(questionText);
    cy.contains('button', 'add new').click();
    cy.contains('button', 'add new').click();
    cy.get('[placeholder="Option"]').then(elements => {
      cy.wrap(elements[0]).type('Yes');
      cy.wrap(elements[1]).type('No');
    })
    cy.contains('button', 'Create question').click();
    cy.contains('a', questionText).should('be.visible');

    // Add a notice to the "Yes" path
    // this does not work
    cy.get('li.hanger').then(elements => {
      cy.wrap(elements[1]).click()
    });
    cy.get('select').select('Notice');
    const yesNoticeResult = "Yes! This is a test.";
    cy.get('input[placeholder="Notice"').type(yesNoticeResult);
    cy.contains('button', 'Create notice').click();

    // Add a notice to the "No" path
    cy.get('li.card.option:nth-child(2) > ol > li > a').click();
    cy.get('select').select('Notice');
    const noNoticeResult = "Sorry, this is a test";
    cy.get('input[placeholder="Notice"]').type(noNoticeResult);
    cy.contains('Create notice').click();

    // Open preview URL
    cy.get('a[href*=preview')
      .should('have.attr', 'href')
      .then(href => {
        cy.visit(href);
      });

    // Test flow
    cy.contains('p', 'Yes').click();
    cy.contains('button', 'Continue').click();
    cy.contains('h3', yesNoticeResult).should('exist');

    cy.contains('button', 'Back').click();

    cy.contains('button > div > p', 'No').click();
    cy.contains('button', 'Continue').click();
    cy.contains('h3', noNoticeResult).should('exist');
  });
})

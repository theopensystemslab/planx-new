// @ts-nocheck
const TEAM_NAME = "test-team";
const USER_EMAIL = "test@test.com";
const SERVICE_NAME = "test-service";
const GRAPHQL_URL = "http://localhost:7000/v1/graphql";

context('Retry requests with network error', () => {
  before(() => {
    cy.insertTeam(TEAM_NAME).as('teamId');
    cy.insertTestUser(USER_EMAIL).as('userId');
  });

  after(function () {
    cy.deleteUsers([this.userId])
      .then(response => {
        const { errors } = response;
        expect(errors, "Delete users").to.equal(undefined);
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

  it("Shows error toast when there is a network error and removes it when a retry is successful", function () {
    // Log in
    cy.get('a').should('have.text', 'Login with Google');
    cy.getJWT(this.userId).then((jwt) => {
      cy.setJWT(jwt);
    });

    // Switch to mock api after teams are loaded
    cy.contains('h2', TEAM_NAME).should('exist');
    cy.intercept({
      url: GRAPHQL_URL,
      method: 'POST'
    }, {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    });
    cy.contains('h2', TEAM_NAME).click();

    // Expect error toast
    const toastText = "Network error, attempting to reconnect…";
    cy.contains('div', toastText).should('exist');

    // Switch back from mocked api
    cy.intercept({ url: GRAPHQL_URL, method: 'POST' }, (req) => {
      req.continue()
    });
    cy.contains('h1', 'My services').should('exist');
    cy.contains('div', toastText).should('not.exist');
  });
})

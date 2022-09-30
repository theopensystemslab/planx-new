const { sign } = require("jsonwebtoken");

Cypress.Commands.add('gqlAdmin', (query, variables = {}) => {
  const HASURA_GRAPHQL_ADMIN_SECRET = Cypress.env('HASURA_GRAPHQL_ADMIN_SECRET');
  const HASURA_PROXY_PORT = Cypress.env('HASURA_PROXY_PORT');

  return cy.request({
    url: `http://0.0.0.0:${HASURA_PROXY_PORT}/v1/graphql`,
    method: "POST",
    headers: {
      "X-Hasura-Admin-Secret": HASURA_GRAPHQL_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  }).then(response => {
    const { body: json } = response;

    if (json.errors && json.errors[0].message.includes("x-hasura-admin-secret")) {
      throw Error("Invalid HASURA_SECRET");
    }

    return json;
  })
});

Cypress.Commands.add("setJWT", (jwt) => {
  cy.setCookie("jwt", jwt);
  cy.reload();
});

Cypress.Commands.add("getJWT", (userId) => {
  const data = {
    sub: String(userId),
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["admin"],
      "x-hasura-default-role": "admin",
      "x-hasura-user-id": String(userId),
    },
  };

  return sign(data, Cypress.env('JWT_SECRET'));
});

Cypress.Commands.add("insertTeam", (teamName) => {
  return cy.gqlAdmin(`
      mutation {
        delete_teams(where: {slug: {_eq: "${teamName}"}}) {
          affected_rows
        }
        insert_teams(objects: {name: "${teamName}", slug: "${teamName}"}) {
          returning { id }
        }
      }
    `).then((response) => {
    const {
      data: {
        insert_teams: {
          returning: [{ id: teamId }],
        },
      },
    } = response;

    return teamId;
  });
});

Cypress.Commands.add("insertTestUser", (userEmail) => {
  return cy.gqlAdmin(`
    mutation {
      delete_users(where: {email: {_eq: "${userEmail}"}}) {
        affected_rows
      }
      insert_users(objects: {first_name: "test", last_name: "test", email: "${userEmail}"}) {
        returning { id }
      }
    }
  `).then((response) => {
    const {
      data: {
        insert_users: {
          returning: [{ id: userId }],
        },
      },
    } = response;

    return userId;
  })
});

Cypress.Commands.add('cleanAnalytics', () => {
  return cy.gqlAdmin(`
    mutation {
      delete_analytics_logs(where: {}) {
        affected_rows
      }
      delete_analytics(where: {}) {
        affected_rows
      }
    }
  `);
})

Cypress.Commands.add('deleteUsers', (userIds = []) => {
  return cy.gqlAdmin(`
    mutation {
      delete_operations(where: {actor_id: {_in: ${JSON.stringify(userIds)}}}) {
        affected_rows
      }
      delete_users(where: {id: {_in: ${JSON.stringify(userIds)}}}) {
        affected_rows
      }
    }
  `);
});

Cypress.Commands.add('deleteFlowsByTeamIdsAndSlugs', (teamIds = [], flowSlugs = []) => {
  return cy.gqlAdmin(`
    mutation {
      delete_flows(where: {
        team_id: {_in: ${JSON.stringify(teamIds)}}, 
        slug: {_in: ${JSON.stringify(flowSlugs)}}
      }) {
        affected_rows
      }
    }
  `);
});

Cypress.Commands.add('deleteTeams', (teamIds = []) => {
  return cy.gqlAdmin(`
    mutation {
      delete_teams(where: {id: {_in: ${JSON.stringify(teamIds)}}}) {
        affected_rows
      }
    }
  `);
})
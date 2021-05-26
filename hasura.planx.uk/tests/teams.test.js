const assert = require("assert");

const { gqlAdmin, gqlPublic } = require("./utils");

describe("teams", () => {
  let teamId;

  beforeAll(async () => {
    ({
      data: {
        insert_teams: {
          returning: [{ id: teamId }],
        },
      },
    } = await gqlAdmin(`
      mutation InsertTeam {
        insert_teams(objects: {slug: "test", name: "Test"}) {
          returning { id }
        }
      }
    `));
    assert(teamId);
  });

  afterAll(async () => {
    // XXX: We're assuming that if we delete the team, then
    //      deletion will cascade into team_members
    assert.strictEqual(
      (await gqlAdmin(`
        mutation DeleteTeamCascade {
          delete_teams(where: {id: {_eq: "${teamId}"}}) { 
            affected_rows 
          }
        }
      `)).data.delete_flows.affected_rows,
      1
    );
  });

  test("only admin can query relational team_members", async () => {
    query = `
      query GetTeamWithMembers {
        teams(where: {id: {_eq: "${teamId}"}}) {
          id
          name
          members {
            user_id
          }
        }
      }
    `;

    assert((await gqlAdmin(query)).data.teams);
    assert(
      (await gqlPublic(query)).errors[0].message, 
      `field "members" not found in type: 'teams'`
    );
  });

  test("public cannot create a new team", async () => {
    query = `
      mutation InsertTeam {
        insert_teams(objects: {slug: "foo", name: "Bar"}) {
          affected_rows
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "insert_teams" not found in type: 'mutation_root'`
    );
  });

  test("public cannot update an existing team", async () => {
    query = `
      mutation UpdateTeam {
        update_teams_by_pk(pk_columns: {
          id: "${teamId}"},
          _set: {name: "New team"}
        ) { id }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "update_teams_by_pk" not found in type 'mutation_root'`
    );
  });

  test("public cannot delete a team", async () => {
    query = `
      mutation DeleteTeam {
        delete_teams(where: {id: {_eq: ${teamId}}}) {
          affected_rows
        }
      }
    `;

    assert(
      (await gqlPublic(query)).errors[0].message,
      `field "delete_teams" not found in type: 'mutation_root'`
    );
  });
});

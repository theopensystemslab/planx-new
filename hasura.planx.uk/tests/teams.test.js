const { gqlAdmin, gqlPublic } = require("./utils");

describe("teams and team_members", () => {
  const INTROSPECTION_QUERY = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          description
          fields {
            name
          }
        }
      }
    }
  `;

  test("public can query teams, but not their associated team members", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);

    expect(queries).toContain('teams');
    expect(queries).not.toContain('team_members');
  });

  test("admin can query teams and team members", async () => {
    const response = await gqlAdmin(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);

    expect(queries).toContain('teams');
    expect(queries).toContain('team_members');
  });

  test("public cannot create, update, or delete teams or team members", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).not.toContain('insert_teams');
    expect(mutations).not.toContain('insert_team_members');
    expect(mutations).not.toContain('update_teams_by_pk');
    expect(mutations).not.toContain('update_team_members_by_pk');
    expect(mutations).not.toContain('delete_teams');
    expect(mutations).not.toContain('delete_team_members');
  });
});

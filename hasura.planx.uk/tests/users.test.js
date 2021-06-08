const { gqlPublic, gqlAdmin } = require("./utils");

describe("users", () => {
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

  test("public cannot query users", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);

    expect(queries).not.toContain('users');
  });

  test("public cannot create, update, or delete users", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).not.toContain('insert_users');
    expect(mutations).not.toContain('update_users_by_pk');
    expect(mutations).not.toContain('delete_users');
  });

  test("admin has full access to query and mutate users", async () => {
    const response = await gqlAdmin(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(queries).toContain('users');
    expect(mutations).toContain('insert_users');
    expect(mutations).toContain('update_users_by_pk');
    expect(mutations).toContain('delete_users');
  });
});

const { gqlPublic, gqlAdmin } = require("./utils");

describe("global_settings", () => {
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

  test("public can query global settings", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);

    expect(queries).toContain('global_settings');
  });

  test("public cannot create, update, or delete global settings", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).not.toContain('insert_global_settings');
    expect(mutations).not.toContain('update_global_settings_by_pk');
    expect(mutations).not.toContain('delete_global_settings');
  });

  test("admin has full access to query and mutate global settings", async () => {
    const response = await gqlAdmin(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(queries).toContain('global_settings');
    expect(mutations).toContain('insert_global_settings');
    expect(mutations).toContain('update_global_settings_by_pk');
    expect(mutations).toContain('delete_global_settings');
  });
});

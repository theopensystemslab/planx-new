const { gqlAdmin, gqlPublic } = require("./utils");

describe("flows and operations", () => {
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

  test("public can query flows, but not the flows associated operations", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);

    expect(queries).toContain('flows');
    expect(queries).not.toContain('operations');
  });

  test("public cannot create, update, or delete flows or their associated operations", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).not.toContain('insert_flows');
    expect(mutations).not.toContain('update_flows_by_pk');
    expect(mutations).not.toContain('delete_flows');
    expect(mutations).not.toContain('insert_operations');
    expect(mutations).not.toContain('delete_operations');
  });

  test("admin can delete flows and their associated operations", async () => {
    const response = await gqlAdmin(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).toContain('delete_flows_by_pk');
    expect(mutations).toContain('delete_operations');
  });
});

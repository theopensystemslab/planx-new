const { gqlPublic } = require("./utils");

describe("bops_applications", () => {
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

  test("public cannot query bops applications", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);

    expect(queries).not.toContain('bops_applications');
  });

  test("public cannot create, update, or delete bops applications", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).not.toContain('insert_bops_applications');
    expect(mutations).not.toContain('update_bops_applications_by_pk');
    expect(mutations).not.toContain('delete_bops_applications');
  });
});

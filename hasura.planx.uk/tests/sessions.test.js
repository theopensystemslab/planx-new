const { gqlAdmin, gqlPublic } = require("./utils");

describe("sessions and session_events", () => {
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

  test("public can query sessions and their associated session events", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const queries = types.find(x => x.name === 'query_root').fields.map(x => x.name);

    expect(queries).toContain('sessions');
    expect(queries).not.toContain('session_events');
  });

  test("public can create and update sessions & session_events, but not delete them", async () => {
    const response = await gqlPublic(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).toContain('insert_sessions_one');
    expect(mutations).toContain('insert_session_events');
    expect(mutations).toContain('update_sessions_by_pk');
    expect(mutations).not.toContain('delete_sessions');
    expect(mutations).not.toContain('delete_session_events');
  });

  test("admin can delete sessions and session events", async () => {
    const response = await gqlAdmin(INTROSPECTION_QUERY);
    const { types } = response.data.__schema;
    const mutations = types.find(x => x.name === 'mutation_root').fields.map(x => x.name);

    expect(mutations).toContain('delete_sessions');
    expect(mutations).toContain('delete_session_events');
  });
});

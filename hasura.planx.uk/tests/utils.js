const fetch = require("isomorphic-fetch");

async function gqlAdmin(query, variables = {}) {
  const res = await fetch(`http://${process.env.HASURA_HOST}:${process.env.HASURA_PORT}/v1/graphql`, {
    method: "POST",
    headers: {
      "X-Hasura-Admin-Secret": process.env.HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors && json.errors[0].message.includes("x-hasura-admin-secret")) {
    throw Error("Invalid HASURA_SECRET");
  }
  return json;
}

async function gqlPublic(query, variables = {}, headers = {}) {
  const res = await fetch(`http://${process.env.HASURA_HOST}:${process.env.HASURA_PORT}/v1/graphql`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ query: query, variables }),
  });
  return await res.json();
}

/**
 * Helper method for introspecting as a specific user
 * @param {string} role ("public" or "admin")
 * @example
 * const { types, queries, mutations } = await introspectAs("public")
 */
const introspectAs = async (role) => {
  const gql = role === "admin" ? gqlAdmin : gqlPublic;
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
  const response = await gql(INTROSPECTION_QUERY);
  const { types } = response.data.__schema;
  const queries = types
    .find((x) => x.name === "query_root")
    .fields.map((x) => x.name);
  const mutations = types
    .find((x) => x.name === "mutation_root")
    .fields.map((x) => x.name);

  return {
    types,
    queries,
    mutations,
  };
};

module.exports = {
  gqlAdmin,
  gqlPublic,
  introspectAs,
};

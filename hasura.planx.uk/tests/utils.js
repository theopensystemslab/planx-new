const fetch = require("isomorphic-fetch");
const jsonwebtoken = require("jsonwebtoken");

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
 * Get a role-based connection to Hasura
 * @param {string} role 
 * @param {number} userId 
 * @returns A GQL client which authenticates to Hasura with the given role and userId
 */
function gqlWithRole(role, userId) {
  const jwt = buildJWTForRole(role, userId)

  const gql = async (query, variables = {}, headers = {}) => {
    const res = await fetch(`http://${process.env.HASURA_HOST}:${process.env.HASURA_PORT}/v1/graphql`, {
      method: "POST",
      headers: {
        ...headers,
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ query: query, variables }),
    });
    return await res.json();
  }

  return gql;
}

/**
 * @param {string} role 
 * @param {number} userId 
 * @returns {string}
 */
function buildJWTForRole(role, userId = 1) {
  const hasura = {
    "x-hasura-allowed-roles": [role],
    "x-hasura-default-role": role,
    "x-hasura-role": role,
    "x-hasura-user-id": userId.toString(),
  };

  const data = {
    sub: userId.toString(),
    "https://hasura.io/jwt/claims": hasura,
  };

  const jwt = jsonwebtoken.sign(data, process.env.JWT_SECRET);
  return jwt;
}

/**
 * Helper method for introspecting as a specific user
 * @param {string} role ("public", "admin" or "platformAdmin")
 * @param {number} userId
 * @example
 * const { types, queries, mutations } = await introspectAs("public")
 */
const introspectAs = async (role, userId = undefined) => {
  const gql = {
    admin: gqlAdmin,
    public: gqlPublic,
    platformAdmin: gqlWithRole("platformAdmin", userId),
  }[role]
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

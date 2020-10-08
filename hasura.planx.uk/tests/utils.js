const fetch = require("isomorphic-fetch");

const HASURA_ADMIN_SECRET = "TODO";
const HASURA_PORT = 7000;

async function gqlAdmin(query) {
  const res = await fetch(`http://0.0.0.0:${HASURA_PORT}/v1/graphql`, {
    method: "POST",
    headers: {
      "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query }),
  });
  return await res.json();
}

async function gqlPublic(query) {
  const res = await fetch(`http://0.0.0.0:${HASURA_PORT}/v1/graphql`, {
    method: "POST",
    body: JSON.stringify({ query }),
  });
  return await res.json();
}

module.exports = {
  gqlAdmin,
  gqlPublic,
};

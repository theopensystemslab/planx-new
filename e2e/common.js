const { sign } = require("jsonwebtoken");
import { ClientFunction } from "testcafe";
const fetch = require("isomorphic-fetch");

const HASURA_API_ENDPOINT = "http://localhost:7002/hasura/v1/graphql"
const HASURA_ADMIN_SECRET = "TODO";

export function getAdminJWT(userId) {
  const data = {
    sub: String(userId),
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["admin"],
      "x-hasura-default-role": "admin",
      "x-hasura-user-id": String(userId),
    },
  };

  return sign(data, process.env.JWT_SECRET);
}

export async function setJWT(jwt) {
  await ClientFunction((jwt) => {
    document.cookie = `jwt=${jwt}`;
    window.location.reload();
  })(jwt);
}

export async function gqlAdmin(query, variables = {}) {
  const res = await fetch(HASURA_API_ENDPOINT, {
    method: "POST",
    headers: {
      "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors && json.errors[0].message.includes("x-hasura-admin-secret")) {
    throw Error("Invalid HASURA_SECRET");
  }
  return json;
}
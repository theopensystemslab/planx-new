import { sign } from "jsonwebtoken";

function getJWT(userId) {
  const data = {
    sub: String(userId),
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": ["platformAdmin", "public"],
      "x-hasura-default-role": "platformAdmin",
      "x-hasura-user-id": String(userId),
    },
  };

  return sign(data, process.env.JWT_SECRET);
}

function authHeader(userId) {
  return { Authorization: `Bearer ${getJWT(userId || 0)}` };
}

export { authHeader, getJWT };

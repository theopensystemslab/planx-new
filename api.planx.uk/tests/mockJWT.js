import { sign } from "jsonwebtoken";

function getJWT(userId) {
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

function authHeader(userId) {
  return { Authorization: `Bearer ${getJWT(userId || 0)}` };
}

export { authHeader, getJWT };

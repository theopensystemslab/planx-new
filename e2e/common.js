const { sign } = require("jsonwebtoken");
import { ClientFunction } from "testcafe";
export { gqlAdmin } from "../hasura.planx.uk/tests/utils";

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

export async function setJWT(t, jwt) {
  await ClientFunction((jwt) => {
    document.cookie = `jwt=${jwt}`;
    window.location.reload();
  })(jwt);
}
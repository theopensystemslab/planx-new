import { Role } from "@opensystemslab/planx-core/types";
import { sign } from "jsonwebtoken";

function getJWT({ role }: { role: Role }) {
  const data = {
    sub: "123",
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": [role],
      "x-hasura-default-role": role,
      "x-hasura-user-id": "123",
    },
  };

  return sign(data, process.env.JWT_SECRET!);
}

function authHeader({ role }: { role: Role }) {
  return { Authorization: `Bearer ${getJWT({ role })}` };
}

export { authHeader, getJWT };

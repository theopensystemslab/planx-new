import type { Role } from "@opensystemslab/planx-core/types";
import jwt from "jsonwebtoken";

function getJWT({ role }: { role: Role }) {
  const data = {
    sub: "123",
    email: "test@opensystemslab.io",
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": [role],
      "x-hasura-default-role": role,
      "x-hasura-user-id": "123",
    },
  };

  return jwt.sign(data, process.env.JWT_SECRET!);
}

function authHeader({ role }: { role: Role }) {
  return { Authorization: `Bearer ${getJWT({ role })}` };
}

export { authHeader, getJWT };

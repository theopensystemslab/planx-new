import type { Role } from "@opensystemslab/planx-core/types";
import jwt from "jsonwebtoken";

function getTestJWT({
  role,
  isExpired = false,
}: {
  role: Role;
  isExpired?: boolean;
}) {
  const data = {
    sub: "123",
    email: "test@opensystemslab.io",
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": [role],
      "x-hasura-default-role": role,
      "x-hasura-user-id": "123",
    },
    // 1st Jan, 1970
    ...(isExpired && { exp: 0 }),
  };

  return isExpired
    ? // Expiry hardcoded to token
      jwt.sign(data, process.env.JWT_SECRET!)
    : // Generate standard 24hr expiry
      jwt.sign(data, process.env.JWT_SECRET!, { expiresIn: "24h" });
}

function authHeader({ role }: { role: Role }) {
  return { Authorization: `Bearer ${getTestJWT({ role })}` };
}

function expiredAuthHeader({ role }: { role: Role }) {
  return { Authorization: `Bearer ${getTestJWT({ role, isExpired: true })}` };
}

export { authHeader, getTestJWT, expiredAuthHeader };

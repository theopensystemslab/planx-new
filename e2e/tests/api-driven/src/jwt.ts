import JWT from "jsonwebtoken";
import { User, Role } from "@opensystemslab/planx-core/types";
import { $admin } from "./client.js";

// This code is copied from api.planx.uk/modules/auth/service.ts

export const buildJWT = async (email: string): Promise<string | undefined> => {
  const user = await $admin.user.getByEmail(email);
  if (!user) return;

  const data = {
    sub: user.id.toString(),
    "https://hasura.io/jwt/claims": generateHasuraClaimsForUser(user),
  };

  const jwt = JWT.sign(data, process.env.JWT_SECRET!);
  return jwt;
};

const generateHasuraClaimsForUser = (user: User) => ({
  "x-hasura-allowed-roles": getAllowedRolesForUser(user),
  "x-hasura-default-role": getDefaultRoleForUser(user),
  "x-hasura-user-id": user.id.toString(),
});

/**
 * Get all possible roles for this user
 * Requests made outside this scope will not be authorised by Hasura
 */
const getAllowedRolesForUser = (user: User): Role[] => {
  const teamRoles = user.teams.map((teamRole) => teamRole.role);
  const allowedRoles: Role[] = [
    "public", // Allow public access
    ...teamRoles, // User specific roles
  ];
  if (user.isPlatformAdmin) allowedRoles.push("platformAdmin");

  return [...new Set(allowedRoles)];
};

/**
 * The default role is used for all requests
 * Can be overwritten on a per-request basis in the client using the x-hasura-role header
 * set to a role in the x-hasura-allowed-roles list
 *
 * This is the role of least privilege for the user
 */
const getDefaultRoleForUser = (user: User): Role => {
  const teamRoles = user.teams.map((teamRole) => teamRole.role);
  const isDemoUser = teamRoles.includes("demoUser");
  if (user.isPlatformAdmin) return "platformAdmin";
  if (isDemoUser) return "demoUser";

  return "teamEditor";
};

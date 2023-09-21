import { sign } from "jsonwebtoken";
import { $admin } from "../../client";
import { User, Role } from "@opensystemslab/planx-core/types";

export const buildJWT = async (email: string): Promise<string | undefined> => {
  const user = await $admin.user.getByEmail(email);
  if (!user) return;

  const data = {
    sub: user.id.toString(),
    email,
    "https://hasura.io/jwt/claims": generateHasuraClaimsForUser(user),
  };

  const jwt = sign(data, process.env.JWT_SECRET!);
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
    "teamEditor", // Least privileged role for authenticated users - required for Editor access
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
  return user.isPlatformAdmin ? "platformAdmin" : "teamEditor";
};

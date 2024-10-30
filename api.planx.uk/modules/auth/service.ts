import jwt from "jsonwebtoken";
import { $api } from "../../client/index.js";
import type { User, Role } from "@opensystemslab/planx-core/types";
import type { HasuraClaims, JWTData } from "./types.js";

export const buildJWT = async (email: string): Promise<string | undefined> => {
  const user = await $api.user.getByEmail(email);
  if (!user) return;

  const hasAccess = await checkUserCanAccessEnv(user, process.env.NODE_ENV);
  if (!hasAccess) return;

  const data: JWTData = {
    sub: user.id.toString(),
    email,
    "https://hasura.io/jwt/claims": generateHasuraClaimsForUser(user),
  };

  return jwt.sign(data, process.env.JWT_SECRET!);
};

export const buildJWTForAPIRole = () =>
  jwt.sign(
    {
      "https://hasura.io/jwt/claims": {
        "x-hasura-allowed-roles": ["api"],
        "x-hasura-default-role": "api",
      },
    },
    process.env.JWT_SECRET!,
  );

const generateHasuraClaimsForUser = (user: User): HasuraClaims => ({
  "x-hasura-allowed-roles": getAllowedRolesForUser(user),
  "x-hasura-default-role": getDefaultRoleForUser(user),
  "x-hasura-user-id": user.id,
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
  if (user.isPlatformAdmin) return "platformAdmin";

  const isTeamEditor = user.teams.find((team) => team.role === "teamEditor");
  if (isTeamEditor) return "teamEditor";

  const isTeamViewer = user.teams.find((team) => team.role === "teamViewer");
  if (isTeamViewer) return "teamViewer";

  return "demoUser";
};

export const checkUserCanAccessEnv = async (
  user: User,
  env?: string,
): Promise<boolean> => {
  // All users can access non-production environments
  const isProduction = env === "production";
  if (!isProduction) return true;

  const isDemoUser = getAllowedRolesForUser(user).includes("demoUser");
  if (isDemoUser) return false;

  const isStagingOnlyUser = await $api.user.isStagingOnly(user.email);
  if (isStagingOnlyUser) return false;

  return true;
};

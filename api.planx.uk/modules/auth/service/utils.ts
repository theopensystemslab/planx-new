import { $api } from "../../../client/index.js";
import type { User, Role } from "@opensystemslab/planx-core/types";

/**
 * Get all possible roles for this user
 * Requests made outside this scope will not be authorised by Hasura
 */
export const getAllowedRolesForUser = (user: User): Role[] => {
  const teamRoles = user.teams.map((teamRole) => teamRole.role);
  const allowedRoles: Role[] = [
    "public", // Allow public access
    ...teamRoles, // User specific roles
  ];
  if (user.isPlatformAdmin) allowedRoles.push("platformAdmin");

  return [...new Set(allowedRoles)];
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

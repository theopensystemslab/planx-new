import { $admin } from "../../../client/index.js";
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
  if (user.isAnalyst) allowedRoles.push("analyst");

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

  const isStagingOnlyUser = await $admin.user.isStagingOnly(user.email);
  if (isStagingOnlyUser) return false;

  return true;
};

/**
 * Validate that a given URL/origin is a trusted redirect destination
 * Only allow known domains to prevent open redirect vulnerabilities
 */
export const isValidRedirect = (url: string): boolean => {
  try {
    // ensure we are validating against an origin (i.e. no path/query)
    const { origin } = new URL(url);

    // production and staging editors
    if (/^https:\/\/editor\.planx\.(uk|dev)$/.test(origin)) return true;

    // PR test build (pizza) environments
    if (/^https:\/\/\d{4,5}\.planx\.pizza$/.test(origin)) return true;

    // local dev
    if (/^http:\/\/(127\.0\.0\.1|localhost):3000$/.test(origin)) return true;

    return false;
  } catch (err) {
    console.error(`Could not validate URL: ${url}`, err);
    return false;
  }
};

import jwt from "jsonwebtoken";
import { $admin } from "../../../client/index.js";
import type { User, Role } from "@opensystemslab/planx-core/types";
import type { HasuraClaims, JWTData } from "../types.js";
import { checkUserCanAccessEnv, getAllowedRolesForUser } from "./utils.js";
import { fromUnixTime } from "date-fns";

export const buildUserJWT = async (
  email: string,
): Promise<string | undefined> => {
  const user = await $admin.user.getByEmail(email);
  if (!user) return;

  const hasAccess = await checkUserCanAccessEnv(user, process.env.NODE_ENV);
  if (!hasAccess) return;

  const data: JWTData = {
    sub: user.id.toString(),
    email,
    "https://hasura.io/jwt/claims": generateHasuraClaimsForUser(user),
  };

  return jwt.sign(data, process.env.JWT_SECRET!, { expiresIn: "24h" });
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
  "x-hasura-user-id": user.id.toString(),
});

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

/**
 * Extracts the expiration timestamp from a JWT token
 */
export const getJWTExpiration = (token: string): Date => {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || typeof decoded === "string" || !decoded.payload) {
      throw new Error("Invalid JWT format");
    }

    const payload = decoded.payload;

    if (typeof payload === "string" || !payload?.exp) {
      throw new Error("Expiry date missing from JWT");
    }

    const expiry = fromUnixTime(payload.exp);
    return expiry;
  } catch (error) {
    throw new Error(
      `Failed to decode JWT: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

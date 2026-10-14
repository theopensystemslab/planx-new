import type { Role } from "@opensystemslab/planx-core/types";

import { useCurrentTeamRole } from "./useCurrentTeamRole";

export const usePermission = (roles: Role[]): boolean => {
  const role = useCurrentTeamRole();
  const hasPermission = Boolean(role && roles.includes(role));
  return hasPermission;
};

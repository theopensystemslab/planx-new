import type { Role } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";

export const usePermission = (roles: Role[]): boolean => {
  const role = useStore(state => state.getUserRoleForCurrentTeam());
  const hasPermission = Boolean(role && roles.includes(role));
  return hasPermission;
}
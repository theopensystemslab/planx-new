import { usePermission } from "hooks/usePermission";

export const useTeamManagementPermissions = () => {
  const canManageActiveMembers = usePermission(["platformAdmin", "teamEditor"]);
  const canManageAdmins = usePermission(["platformAdmin"]);

  return {
    canManageActiveMembers,
    canManageAdmins,
  };
};
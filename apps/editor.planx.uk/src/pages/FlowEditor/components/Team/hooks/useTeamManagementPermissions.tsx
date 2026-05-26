import { usePermission } from "hooks/usePermission";

export const useTeamManagementPermissions = () => {
  const isTeamEditor = usePermission(["platformAdmin", "teamEditor"]);
  const isPlatformAdmin = usePermission(["platformAdmin"]);

  return {
    canManageActiveMembers: isTeamEditor,
    canManageAdmins: isPlatformAdmin,
  };
};
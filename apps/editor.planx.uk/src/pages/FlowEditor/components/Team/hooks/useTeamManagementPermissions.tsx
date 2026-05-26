import { usePermission } from "hooks/usePermission";

export const useTeamManagementPermissions = () => {
  const isTeamEditor = usePermission(["platformAdmin", "teamEditor"]);
  const isPlatformAdmin = usePermission(["platformAdmin"]);
  const isTeamAdmin = usePermission(["teamAdmin"]);
  return {
    canManageActiveMembers: isTeamEditor,
    canManagePlatformAdmins: isPlatformAdmin,
    canManageTeamAdmins: isTeamAdmin,
  };
};
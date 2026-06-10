import { usePermission } from "hooks/usePermission";

export const useTeamManagementPermissions = () => {
  const isTeamAdmin = usePermission(["teamAdmin"]);
  const isPlatformAdmin = usePermission(["platformAdmin"]);

  return {
    canManageActiveMembers: isTeamAdmin,
    canManagePlatformAdmins: isPlatformAdmin,
  };
};

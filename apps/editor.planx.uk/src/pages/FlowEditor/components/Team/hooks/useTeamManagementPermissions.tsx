import { usePermission } from "hooks/usePermission";

export const useTeamManagementPermissions = () => {
  const isTeamEditor = usePermission([
    "platformAdmin",
    "teamAdmin",
    "teamEditor",
  ]);
  const isTeamAdmin = usePermission(["teamAdmin"]);
  const isPlatformAdmin = usePermission(["platformAdmin"]);

  return {
    canManageActiveMembers: isTeamEditor,
    canManagePlatformAdmins: isPlatformAdmin,
    canManageTeamAdmins: isPlatformAdmin || isTeamAdmin,
  };
};

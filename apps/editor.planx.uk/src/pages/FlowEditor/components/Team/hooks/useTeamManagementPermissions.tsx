import { usePermission } from "hooks/usePermission";

export const useTeamManagementPermissions = () => {
  const isTeamEditor = usePermission([
    "platformAdmin",
    "teamAdmin",
    "teamEditor",
  ]);
  const isPlatformAdmin = usePermission(["platformAdmin"]);

  return {
    canManageActiveMembers: isTeamEditor,
    canManagePlatformAdmins: isPlatformAdmin,
    canManageTeamAdmins: isPlatformAdmin, // TODO: since managing team admin permissions are in a forthcoming ticket, this ability is limited to platform admin only now
  };
};

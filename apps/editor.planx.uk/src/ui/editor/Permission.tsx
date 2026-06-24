import type { Role } from "@opensystemslab/planx-core/types";
import { usePermission } from "hooks/usePermission";
import React, { PropsWithChildren } from "react";

type FC = React.FC<PropsWithChildren>;

const EDITOR_ROLES: Role[] = ["platformAdmin", "teamAdmin", "teamEditor"];

interface PermissionComponent extends FC {
  /** Platform admins only */
  IsPlatformAdmin: FC;
  /** Everyone except platform admins */
  IsNotPlatformAdmin: FC;
  /** Platform admins, team admins, and team editors for the current team */
  CanEdit: FC;
  /** Everyone without edit access (team viewers, analysts, etc.) */
  CannotEdit: FC;
}

const Permission: PermissionComponent = ({ children }) => {
  return children;
};

const IsPlatformAdmin: FC = ({ children }) =>
  usePermission(["platformAdmin"]) ? children : null;

const IsNotPlatformAdmin: FC = ({ children }) =>
  !usePermission(["platformAdmin"]) ? children : null;

const CanEdit: FC = ({ children }) =>
  usePermission(EDITOR_ROLES) ? children : null;

const CannotEdit: FC = ({ children }) =>
  !usePermission(EDITOR_ROLES) ? children : null;

// Attach permission specific components as static properties
Permission.IsPlatformAdmin = IsPlatformAdmin;
Permission.IsNotPlatformAdmin = IsNotPlatformAdmin;
Permission.CanEdit = CanEdit;
Permission.CannotEdit = CannotEdit;

export default Permission;

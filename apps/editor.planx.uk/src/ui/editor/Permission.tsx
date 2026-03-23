import { usePermission } from "hooks/usePermission";
import React, { PropsWithChildren } from "react";

type FC = React.FC<PropsWithChildren>;

interface PermissionComponent extends FC {
  IsPlatformAdmin: FC;
  IsNotPlatformAdmin: FC;
}

const Permission: PermissionComponent = ({ children }) => {
  return children;
};

const IsPlatformAdmin: FC = ({ children }) =>
  usePermission(["platformAdmin"]) ? children : null;

const IsNotPlatformAdmin: FC = ({ children }) =>
  !usePermission(["platformAdmin"]) ? children : null;


// Attach permission specific components as static properties
Permission.IsPlatformAdmin = IsPlatformAdmin;
Permission.IsNotPlatformAdmin = IsNotPlatformAdmin;

export default Permission;

import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";

type PermissionComponent = React.FC<PropsWithChildren> & {
  IsPlatformAdmin: React.FC<PropsWithChildren>;
} & { IsNotPlatformAdmin: React.FC<PropsWithChildren> };

const Permission: PermissionComponent = ({ children }) => {
  return children;
};

const IsPlatformAdmin: React.FC<PropsWithChildren> = ({ children }) => {
  const isPlatformAdmin = useStore((state) => state.user?.isPlatformAdmin);
  return isPlatformAdmin ? children : null;
};

const IsNotPlatformAdmin: React.FC<PropsWithChildren> = ({ children }) => {
  const isPlatformAdmin = useStore((state) => state.user?.isPlatformAdmin);
  return !isPlatformAdmin ? children : null;
};

// Attach permission specific components as static properties
Permission.IsPlatformAdmin = IsPlatformAdmin;
Permission.IsNotPlatformAdmin = IsNotPlatformAdmin;

export default Permission;

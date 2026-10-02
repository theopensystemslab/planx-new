import type { Role } from "@opensystemslab/planx-core/types";
import type React from "react";
import type { TablerIcon } from "ui/icons/Icon";

type AllUsers = "*";

export interface Route {
  title: string;
  Icon: TablerIcon;
  route: string;
  accessibleBy: Role[] | AllUsers;
  disabled?: boolean;
  isNew?: boolean;
  badgeCount?: number;
}

export interface MenuSection {
  subtitle?: string;
  accordion?: boolean;
  icon?: Route["Icon"];
  routes: Route[];
}

export interface RoutesForURL {
  sections: MenuSection[];
  compact: boolean;
}

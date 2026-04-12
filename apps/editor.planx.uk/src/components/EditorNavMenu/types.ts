import { Role } from "@opensystemslab/planx-core/types";
import React from "react";

type AllUsers = "*";

export interface Route {
  title: string;
  Icon: React.ElementType;
  route: string;
  accessibleBy: Role[] | AllUsers;
  disabled?: boolean;
  isNew?: boolean;
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

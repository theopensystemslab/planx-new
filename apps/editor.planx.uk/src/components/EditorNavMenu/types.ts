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
  routes: Route[];
}

export interface RoutesForURL {
  sections: MenuSection[];
  compact: boolean;
}

import { Role } from "@opensystemslab/planx-core/types";
import React from "react";

export interface Route {
  title: string;
  Icon: React.ElementType;
  route: string;
  accessibleBy: Role[];
  disabled?: boolean;
}
export interface RoutesForURL {
  routes: Route[];
  compact: boolean;
}

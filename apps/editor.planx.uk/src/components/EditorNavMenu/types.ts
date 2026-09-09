import type { Role } from "@opensystemslab/planx-core/types";
import type React from "react";
import type { TeamSearchParams } from "routes/_authenticated/app/$team/route";

type AllUsers = "*";

/** Notion documentation pages openable via the `?guide` search param */
export type GuidePage = NonNullable<TeamSearchParams["guide"]>;

export interface Route {
  title: string;
  Icon: React.ElementType;
  route: string;
  accessibleBy: Role[] | AllUsers;
  disabled?: boolean;
  isNew?: boolean;
  badgeCount?: number;
  /** When set, clicking sets the `?guide` search param (opens a Notion dialog) instead of navigating */
  guide?: GuidePage;
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

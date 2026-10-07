import type { TeamRole, UserRole } from "@opensystemslab/planx-core/types";

export type PermissionRole = UserRole | TeamRole;

/**
 * true - has access
 * false - no access
 * "inconsistent" - access is granted in some places but not others (likely a bug)
 */
export type Access = boolean | "inconsistent";

export interface Permission {
  name: string;
  description?: string;
  access: Record<PermissionRole, Access>;
}

export interface PermissionSection {
  title: string;
  permissions: Permission[];
}

export const ROLES: { role: PermissionRole; label: string }[] = [
  { role: "platformAdmin", label: "Platform admin" },
  { role: "teamAdmin", label: "Team admin" },
  { role: "teamEditor", label: "Team editor" },
  { role: "teamViewer", label: "Team viewer" },
  { role: "analyst", label: "Analyst" },
];

const everyone: Record<PermissionRole, boolean> = {
  platformAdmin: true,
  teamAdmin: true,
  teamEditor: true,
  teamViewer: true,
  analyst: true,
};

const editors: Record<PermissionRole, boolean> = {
  platformAdmin: true,
  teamAdmin: true,
  teamEditor: true,
  teamViewer: false,
  analyst: false,
};

const admins: Record<PermissionRole, boolean> = {
  platformAdmin: true,
  teamAdmin: true,
  teamEditor: false,
  teamViewer: false,
  analyst: false,
};

const platformAdminOnly: Record<PermissionRole, boolean> = {
  platformAdmin: true,
  teamAdmin: false,
  teamEditor: false,
  teamViewer: false,
  analyst: false,
};

/**
 * Number of roles with access to a permission, with inconsistent access ranked below full access
 */
const ACCESS_SCORE: Record<string, number> = {
  true: 1,
  inconsistent: 0.5,
  false: 0,
};

const getCoverage = ({ access }: Permission): number =>
  Object.values(access).reduce<number>(
    (total, value) => total + ACCESS_SCORE[String(value)],
    0,
  );

/**
 * Summary of the functions available to each role within the editor
 * Reflects checks made in the editor (e.g. <Permission />, canUserEditTeam(), route guards)
 */
const SECTIONS: PermissionSection[] = [
  {
    title: "Global / Platform",
    permissions: [
      { name: "View and select teams", access: everyone },
      { name: "Create new teams", access: platformAdminOnly },
      {
        name: "Global settings",
        description: "Manage platform-wide content, such as footer elements",
        access: platformAdminOnly,
      },
      {
        name: "Admin panel",
        description: "View the status and configuration of all teams",
        access: { ...platformAdminOnly, analyst: true },
      },
      {
        name: "User management",
        description: "Add, edit and remove analysts",
        access: platformAdminOnly,
      },
    ],
  },
  {
    title: "Team",
    permissions: [
      { name: "View team dashboard", access: everyone },
      {
        name: "Notifications and feedback widgets on dashboard",
        access: editors,
      },
      { name: "Explore templates and services", access: everyone },
      {
        name: "View notifications",
        description:
          "Bug: Team admins can open the notifications page and dashboard widget, but cannot load any notifications and do not see the notifications menu item",
        access: { ...editors, teamAdmin: "inconsistent" },
      },
      {
        name: "Team settings",
        description:
          "Contact information, GIS data, payments, integrations and design",
        access: editors,
      },
      { name: "Advanced team settings", access: platformAdminOnly },
      { name: "View team members", access: editors },
      { name: "Add, edit and remove team members", access: admins },
      {
        name: "Manage platform admins within a team",
        access: platformAdminOnly,
      },
      { name: "View subscription and service charges", access: admins },
      { name: "Connect a Stripe account", access: editors },
      {
        name: "Documentation",
        description: "Resources, onboarding and tutorials",
        access: everyone,
      },
    ],
  },
  {
    title: "Data",
    permissions: [
      { name: "View submissions", access: editors },
      { name: "Resubmit a submission", access: platformAdminOnly },
      { name: "View feedback", access: editors },
      {
        name: "Analytics",
        description: "Team and flow analytics dashboards",
        access: everyone,
      },
      {
        name: "Planning Data and Local Planning Services links",
        access: everyone,
      },
    ],
  },
  {
    title: "Flows",
    permissions: [
      {
        name: "View flows",
        access: everyone,
      },
      { name: "Create, copy, move and archive flows", access: editors },
      { name: "Create a flow from a template", access: editors },
      {
        name: "Create source templates",
        access: platformAdminOnly,
      },
      {
        name: "Create patterns",
        access: platformAdminOnly,
      },
      { name: "Edit flows", access: editors },
      { name: "Edit flow settings", access: editors },
      { name: "Publish flows", access: editors },
      { name: "Restore a previous version from edit history", access: editors },
      { name: "Edit source templates", access: platformAdminOnly },
      { name: "Edit patterns", access: platformAdminOnly },
      {
        name: "Preview drafts with unpublished nested flows",
        access: platformAdminOnly,
      },
    ],
  },
];

/**
 * Permissions ordered by descending coverage - those available to everyone first,
 * those restricted to platform admins last
 */
export const PERMISSION_SECTIONS: PermissionSection[] = SECTIONS.map(
  (section) => ({
    ...section,
    permissions: [...section.permissions].sort(
      (a, b) => getCoverage(b) - getCoverage(a),
    ),
  }),
);

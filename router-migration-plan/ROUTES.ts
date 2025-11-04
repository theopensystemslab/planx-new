/**
 * Functional Route Structure for PlanX Editor
 * Provides URL builders and represents authentication/protection hierarchy
 */

export const ROUTES = {
  // Global routes (no authentication required)
  global: {
    networkError: () => "/network-error",
    login: (redirectTo?: string) =>
      redirectTo
        ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
        : "/login",
    logout: () => "/logout",
  },

  // Preview-only domain routes (custom council domains)
  previewOnly: {
    // Legacy support - /:team/:flow/published on custom domains
    publishedFlowLegacy: (team: string, flow: string) =>
      `/${team}/${flow}/published`,

    // Main custom domain routes - team inferred from domain
    publishedFlow: (flow: string) => `/${flow}`,
    pay: (flow: string) => `/${flow}/pay`,

    // Content pages
    publishedContentPage: (flow: string, page: string) =>
      `/${flow}/pages/${page}`,
    payContentPage: (flow: string, page: string) =>
      `/${flow}/pay/pages/${page}`,
  },

  // Editor domain routes (authentication required)
  authenticated: {
    // Root level authenticated routes
    teams: () => "/",
    resources: () => "/resources",
    onboarding: () => "/onboarding",
    tutorials: () => "/tutorials",

    // Platform admin only routes
    platformAdmin: {
      globalSettings: () => "/global-settings",
    },

    // Platform admin or analyst routes
    adminPanel: () => "/admin-panel",

    // Team-level routes (team ownership required for some)
    team: {
      // Public team routes
      root: (team: string) => `/${team}`,
      designSettings: (team: string) => `/${team}/design`,
      generalSettings: (team: string) => `/${team}/general-settings`,

      // Team owner required routes
      protected: {
        members: (team: string) => `/${team}/members`,
        feedback: (team: string) => `/${team}/feedback`,
        submissions: (team: string) => `/${team}/submissions`,
      },

      // Flow-level routes
      flow: {
        // Basic flow routes
        root: (team: string, flow: string) => `/${team}/${flow}`,
        about: (team: string, flow: string) => `/${team}/${flow}/about`,
        serviceSettings: (team: string, flow: string) =>
          `/${team}/${flow}/service`,

        // Flow owner required routes
        protected: {
          serviceFeedback: (team: string, flow: string) =>
            `/${team}/${flow}/feedback`,
          serviceSubmissions: (team: string, flow: string) =>
            `/${team}/${flow}/submissions`,
        },

        // Node management routes (flow editor)
        nodes: {
          // Node creation
          new: (team: string, flow: string) => `/${team}/${flow}/nodes/new`,
          newWithBefore: (team: string, flow: string, before: string) =>
            `/${team}/${flow}/nodes/new/${before}`,
          newWithParent: (team: string, flow: string, parent: string) =>
            `/${team}/${flow}/${parent}/nodes/new`,
          newWithParentAndBefore: (
            team: string,
            flow: string,
            parent: string,
            before: string,
          ) => `/${team}/${flow}/${parent}/nodes/new/${before}`,

          // Node editing
          edit: (team: string, flow: string, id: string) =>
            `/${team}/${flow}/${id}/edit`,
          editWithBefore: (
            team: string,
            flow: string,
            id: string,
            before: string,
          ) => `/${team}/${flow}/${id}/edit/${before}`,
          editWithParent: (
            team: string,
            flow: string,
            parent: string,
            id: string,
          ) => `/${team}/${flow}/${parent}/nodes/${id}/edit`,
          editWithParentAndBefore: (
            team: string,
            flow: string,
            parent: string,
            id: string,
            before: string,
          ) => `/${team}/${flow}/${parent}/nodes/${id}/edit/${before}`,
        },
      },
    },

    // Public flow routes (no authentication, but team validation on custom domains)
    public: {
      // Published flows
      published: {
        root: (team: string, flow: string) => `/${team}/${flow}/published`,
        contentPage: (team: string, flow: string, page: string) =>
          `/${team}/${flow}/published/pages/${page}`,
      },

      // Preview flows (draft + published portals)
      preview: {
        root: (team: string, flow: string) => `/${team}/${flow}/preview`,
        contentPage: (team: string, flow: string, page: string) =>
          `/${team}/${flow}/preview/pages/${page}`,
      },

      // Draft flows
      draft: {
        root: (team: string, flow: string) => `/${team}/${flow}/draft`,
        contentPage: (team: string, flow: string, page: string) =>
          `/${team}/${flow}/draft/pages/${page}`,
      },

      // Payment flows
      pay: {
        root: (team: string, flow: string) => `/${team}/${flow}/pay`,
        notFound: (team: string, flow: string) =>
          `/${team}/${flow}/pay/not-found`,
        invite: (team: string, flow: string) => `/${team}/${flow}/pay/invite`,
        inviteFailed: (team: string, flow: string) =>
          `/${team}/${flow}/pay/invite/failed`,
        contentPage: (team: string, flow: string, page: string) =>
          `/${team}/${flow}/pay/pages/${page}`,
        inviteContentPage: (team: string, flow: string, page: string) =>
          `/${team}/${flow}/pay/invite/pages/${page}`,
      },

      // Email submission download
      emailSubmission: (team: string, flow: string, sessionId: string) =>
        `/${team}/${flow}/${sessionId}/download-application`,
    },
  },
} as const;

/**
 * Route parameter types for type safety
 */
export interface RouteParams {
  team: string;
  flow: string; // Can contain comma-separated values
  sessionId: string;
  nodeId: string;
  parentNodeId: string;
  beforeNodeId: string;
  page: string;
}

/**
 * Route protection levels
 */
export const ROUTE_PROTECTION = {
  PUBLIC: "public",
  AUTHENTICATED: "authenticated",
  TEAM_OWNER: "team_owner",
  PLATFORM_ADMIN: "platform_admin",
  PLATFORM_ADMIN_OR_ANALYST: "platform_admin_or_analyst",
} as const;

/**
 * Route metadata for each protection level
 */
export const PROTECTED_ROUTES = {
  [ROUTE_PROTECTION.PUBLIC]: [
    // Global routes
    "global.*",
    // Preview-only domain routes
    "previewOnly.*",
    // Public flow routes
    "authenticated.public.*",
  ],

  [ROUTE_PROTECTION.AUTHENTICATED]: [
    "authenticated.teams",
    "authenticated.resources",
    "authenticated.onboarding",
    "authenticated.tutorials",
    "authenticated.team.root",
    "authenticated.team.designSettings",
    "authenticated.team.generalSettings",
    "authenticated.team.flow.root",
    "authenticated.team.flow.about",
    "authenticated.team.flow.serviceSettings",
    "authenticated.team.flow.nodes.*",
  ],

  [ROUTE_PROTECTION.TEAM_OWNER]: [
    "authenticated.team.protected.*",
    "authenticated.team.flow.protected.*",
  ],

  [ROUTE_PROTECTION.PLATFORM_ADMIN]: ["authenticated.platformAdmin.*"],

  [ROUTE_PROTECTION.PLATFORM_ADMIN_OR_ANALYST]: ["authenticated.adminPanel"],
} as const;

/**
 * Domain-specific route availability
 */
export const DOMAIN_ROUTES = {
  PREVIEW_ONLY_DOMAINS: [
    "planningservices.barnet.gov.uk",
    "planningservices.buckinghamshire.gov.uk",
    "planningservices.camden.gov.uk",
    "planningservices.doncaster.gov.uk",
    "planningservices.epsom-ewell.gov.uk",
    "planningservices.gateshead.gov.uk",
    "planningservices.gloucester.gov.uk",
    "planningservices.lambeth.gov.uk",
    "planningservices.lbbd.gov.uk",
    "planningservices.medway.gov.uk",
    "planningservices.newcastle.gov.uk",
    "planningservices.southwark.gov.uk",
    "planningservices.stalbans.gov.uk",
    "planningservices.tewkesbury.gov.uk",
    "planningservices.westberks.gov.uk",
  ],

  getAvailableRoutes: (domain: string) => {
    const isPreviewOnly = DOMAIN_ROUTES.PREVIEW_ONLY_DOMAINS.some((d) =>
      domain.endsWith(d),
    );

    return isPreviewOnly ? ["previewOnly.*"] : ["global.*", "authenticated.*"];
  },
} as const;

/**
 * Route patterns for React Router migration
 */
export const ROUTE_PATTERNS = {
  // Global patterns
  GLOBAL_NETWORK_ERROR: "/network-error",
  GLOBAL_LOGIN: "/login",
  GLOBAL_LOGOUT: "/logout",

  // Authenticated root patterns
  AUTH_TEAMS: "/",
  AUTH_GLOBAL_SETTINGS: "/global-settings",
  AUTH_ADMIN_PANEL: "/admin-panel",
  AUTH_RESOURCES: "/resources",
  AUTH_ONBOARDING: "/onboarding",
  AUTH_TUTORIALS: "/tutorials",

  // Team patterns
  TEAM_ROOT: "/:team",
  TEAM_MEMBERS: "/:team/members",
  TEAM_DESIGN: "/:team/design",
  TEAM_FEEDBACK: "/:team/feedback",
  TEAM_GENERAL_SETTINGS: "/:team/general-settings",
  TEAM_SUBMISSIONS: "/:team/submissions",

  // Flow patterns
  FLOW_ROOT: "/:team/:flow",
  FLOW_ABOUT: "/:team/:flow/about",
  FLOW_SERVICE: "/:team/:flow/service",
  FLOW_FEEDBACK: "/:team/:flow/feedback",
  FLOW_SUBMISSIONS: "/:team/:flow/submissions",

  // Node patterns (most complex)
  NODE_NEW: "/:team/:flow/nodes/new",
  NODE_NEW_BEFORE: "/:team/:flow/nodes/new/:before",
  NODE_NEW_PARENT: "/:team/:flow/:parent/nodes/new",
  NODE_NEW_PARENT_BEFORE: "/:team/:flow/:parent/nodes/new/:before",
  NODE_EDIT: "/:team/:flow/:id/edit",
  NODE_EDIT_BEFORE: "/:team/:flow/:id/edit/:before",
  NODE_EDIT_PARENT: "/:team/:flow/:parent/nodes/:id/edit",
  NODE_EDIT_PARENT_BEFORE: "/:team/:flow/:parent/nodes/:id/edit/:before",

  // Public flow patterns
  PUBLISHED_ROOT: "/:team/:flow/published",
  PUBLISHED_PAGE: "/:team/:flow/published/pages/:page",
  PREVIEW_ROOT: "/:team/:flow/preview",
  PREVIEW_PAGE: "/:team/:flow/preview/pages/:page",
  DRAFT_ROOT: "/:team/:flow/draft",
  DRAFT_PAGE: "/:team/:flow/draft/pages/:page",

  // Payment patterns
  PAY_ROOT: "/:team/:flow/pay",
  PAY_NOT_FOUND: "/:team/:flow/pay/not-found",
  PAY_INVITE: "/:team/:flow/pay/invite",
  PAY_INVITE_FAILED: "/:team/:flow/pay/invite/failed",
  PAY_PAGE: "/:team/:flow/pay/pages/:page",
  PAY_INVITE_PAGE: "/:team/:flow/pay/invite/pages/:page",

  // Email submission
  EMAIL_SUBMISSION: "/:team/:flow/:sessionId/download-application",

  // Preview-only domain patterns
  PREVIEW_DOMAIN_FLOW: "/:flow",
  PREVIEW_DOMAIN_PAY: "/:flow/pay",
  PREVIEW_DOMAIN_LEGACY: "/:team/:flow/published",
} as const;

/**
 * Utility functions for route handling
 */
export const RouteUtils = {
  /**
   * Check if current domain is preview-only
   */
  isPreviewOnlyDomain: (hostname: string): boolean => {
    return DOMAIN_ROUTES.PREVIEW_ONLY_DOMAINS.some((domain) =>
      hostname.endsWith(domain),
    );
  },

  /**
   * Get team slug from domain or URL param
   */
  getTeamSlug: (hostname: string, paramTeam?: string): string | null => {
    // For preview-only domains, team is inferred from domain
    // This would need to be implemented with actual domain->team mapping
    if (RouteUtils.isPreviewOnlyDomain(hostname)) {
      // Implementation would query database for team by domain
      return null; // Placeholder
    }
    return paramTeam || null;
  },

  /**
   * Parse flow parameter (handles comma-separated values)
   */
  parseFlowParam: (
    flowParam: string,
  ): { flowSlug: string; additionalParams: string[] } => {
    const parts = flowParam.split(",");
    return {
      flowSlug: parts[0],
      additionalParams: parts.slice(1),
    };
  },

  /**
   * Check if route requires authentication
   */
  requiresAuth: (path: string): boolean => {
    const publicPatterns = [
      "/network-error",
      "/login",
      "/logout",
      // Published flows are public
      /\/[\w-]+\/[\w-]+\/published/,
      /\/[\w-]+\/[\w-]+\/preview/,
      /\/[\w-]+\/[\w-]+\/draft/,
      /\/[\w-]+\/[\w-]+\/pay/,
      // Preview domain flows are public
      /^\/[\w-]+$/,
      /^\/[\w-]+\/pay$/,
    ];

    return !publicPatterns.some((pattern) =>
      typeof pattern === "string" ? pattern === path : pattern.test(path),
    );
  },

  /**
   * Get protection level for a route
   */
  getProtectionLevel: (path: string): string => {
    if (path.includes("/global-settings"))
      return ROUTE_PROTECTION.PLATFORM_ADMIN;
    if (path.includes("/admin-panel"))
      return ROUTE_PROTECTION.PLATFORM_ADMIN_OR_ANALYST;
    if (path.includes("/members") || path.includes("/feedback"))
      return ROUTE_PROTECTION.TEAM_OWNER;
    if (RouteUtils.requiresAuth(path)) return ROUTE_PROTECTION.AUTHENTICATED;
    return ROUTE_PROTECTION.PUBLIC;
  },
} as const;

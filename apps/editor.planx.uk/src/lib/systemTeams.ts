/**
 * Internal PlanX teams (not LPAs/councils) which should not start on
 * (or be shown) the team Dashboard - they start on the flows page instead.
 * Matched by slug rather than name, since team names can contain special
 * characters (e.g. "Plan✕ Academy" uses a multiplication-sign glyph, not "X").
 */
export const SYSTEM_TEAMS = [
  "opensystemslab",
  "testing",
  "planx-academy",
  "templates",
];

export const isSystemTeam = (teamSlug: string): boolean =>
  SYSTEM_TEAMS.includes(teamSlug);

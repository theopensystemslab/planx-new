/**
 * Internal PlanX teams (not LPAs/councils) which should not start on
 * (or be shown) the team Dashboard - they start on the flows page instead.
 */
export const SYSTEM_TEAMS = [
  "Open Systems Lab",
  "Testing",
  "PlanX Academy",
  "Templates",
];

export const isSystemTeam = (teamName: string): boolean =>
  SYSTEM_TEAMS.includes(teamName);

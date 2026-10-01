/**
 * Values of the team_category_enum table (teams.category)
 * Only "lpa" teams are included in LPA-level reporting
 */
export const TEAM_CATEGORIES = ["lpa", "internal", "other"] as const;

export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

export const TEAM_CATEGORY_LABELS: Record<TeamCategory, string> = {
  lpa: "Local planning authority",
  internal: "Internal",
  other: "Other",
};

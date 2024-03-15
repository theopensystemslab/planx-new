import { MoreInformation, parseMoreInformation } from "../shared";

export interface PlanningConstraints extends MoreInformation {
  title: string;
  description: string;
  fn: string;
  disclaimer: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): PlanningConstraints => ({
  title: data?.title || "Planning constraints",
  description:
    data?.description ||
    "Planning constraints might limit how you can develop or use the property",
  fn: data?.fn || "property.constraints.planning",
  disclaimer: data?.disclaimer || DEFAULT_PLANNING_CONDITIONS_DISCLAIMER,
  ...parseMoreInformation(data),
});

export type IntersectingConstraints = Record<string, string[]>;

export const DEFAULT_PLANNING_CONDITIONS_DISCLAIMER =
  "This page does not include information about historic planning conditions that may apply to this property.";

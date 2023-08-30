import { MoreInformation, parseMoreInformation } from "../shared";

export interface PlanningConstraints extends MoreInformation {
  title: string;
  description: string;
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): PlanningConstraints => ({
  title: data?.title || "Planning constraints",
  description:
    data?.description ||
    "Planning constraints might limit how you can develop or use the property",
  fn: data?.fn || "property.constraints.planning",
  ...parseMoreInformation(data),
});

export type IntersectingConstraints = Record<string, string[]>;

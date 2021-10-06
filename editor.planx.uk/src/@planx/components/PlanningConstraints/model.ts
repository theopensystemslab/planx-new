import { MoreInformation, parseMoreInformation } from "../shared";

export interface PlanningConstraints extends MoreInformation {
  title: string;
  description: string;
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): PlanningConstraints => ({
  title: data?.title || "Planning constraints",
  description: data?.description || "Things that might affect your project",
  fn: data?.fn || "property.constraints.planning",
  ...parseMoreInformation(data),
});

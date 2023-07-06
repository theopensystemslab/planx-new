import { MoreInformation, parseMoreInformation } from "../shared";

export interface NextSteps extends MoreInformation {
  title: string;
  description: string;
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): NextSteps => ({
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});

const DEFAULT_TITLE = "What would you like to do next?";

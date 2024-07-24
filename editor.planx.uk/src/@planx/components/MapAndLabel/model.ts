import { MoreInformation, parseMoreInformation } from "../shared";

export interface MapAndLabel extends MoreInformation {
  fn: string;
  title?: string;
  description?: string;
  lineColour: string;
  fillColour: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): MapAndLabel => ({
  fn: data?.fn || "",
  title: data?.title,
  description: data?.description,
  lineColour: data?.lineColour,
  fillColour: data?.fillColour,
  ...parseMoreInformation(data),
});

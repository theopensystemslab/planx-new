import { MoreInformation, parseMoreInformation } from "../shared";

export interface MapAndLabel extends MoreInformation {
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): MapAndLabel => ({
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});

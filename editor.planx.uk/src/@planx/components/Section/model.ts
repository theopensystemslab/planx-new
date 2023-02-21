import { MoreInformation, parseMoreInformation } from "../shared";

export interface Section extends MoreInformation {
  title: string;
}

export const parseSection = (
  data: Record<string, any> | undefined
): Section => ({
  title: data?.title || "",
  ...parseMoreInformation(data),
});

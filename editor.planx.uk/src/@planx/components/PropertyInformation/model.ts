import { MoreInformation, parseMoreInformation } from "../shared";

export interface PropertyInformation extends MoreInformation {}

export const parsePropertyInformation = (
  data: Record<string, any> | undefined
): PropertyInformation => ({
  ...parseMoreInformation(data),
});

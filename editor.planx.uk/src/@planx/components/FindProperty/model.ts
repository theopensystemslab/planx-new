import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindProperty extends MoreInformation {}

export const parseFindProperty = (
  data: Record<string, any> | undefined
): FindProperty => ({
  ...parseMoreInformation(data),
});

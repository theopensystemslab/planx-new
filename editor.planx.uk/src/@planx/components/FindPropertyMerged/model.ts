import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindPropertyMerged extends MoreInformation {}

export const parseFindPropertyMerged = (
  data: Record<string, any> | undefined
): FindPropertyMerged => ({
  ...parseMoreInformation(data),
});

import { MoreInformation, parseMoreInformation } from "../shared";

export interface PropertyInformation extends MoreInformation {
  title: string;
  description: string;
  showPropertyTypeOverride?: boolean;
}

export const parseContent = (
  data: Record<string, any> | undefined
): PropertyInformation => ({
  title: data?.title || "About the property",
  description:
    data?.description ||
    "This is the information we currently have about the property",
  showPropertyTypeOverride: data?.showPropertyTypeOverride || false,
  ...parseMoreInformation(data),
});

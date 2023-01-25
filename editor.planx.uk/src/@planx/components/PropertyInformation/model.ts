import { MoreInformation, parseMoreInformation } from "../shared";

export interface PropertyInformation extends MoreInformation {
  title: string;
  description: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): PropertyInformation => ({
  title: data?.title || "About the property",
  description:
    data?.description ||
    "This is the information we currently have about the property",
  ...parseMoreInformation(data),
});

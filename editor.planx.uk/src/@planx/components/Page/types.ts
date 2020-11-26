import { MoreInformation, parseMoreInformation } from "../shared";

export interface Page extends MoreInformation {
  title: string;
  description: string;
}

export const parsePage = (data: Record<string, any> | undefined) => ({
  // TODO: improve runtime validation here (joi, io-ts)
  title: data?.title || "",
  description: data?.description || "",
  ...parseMoreInformation(data),
});

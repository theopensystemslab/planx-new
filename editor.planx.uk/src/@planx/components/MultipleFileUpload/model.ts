import { MoreInformation, parseMoreInformation } from "../shared";

export interface MultipleFileUpload extends MoreInformation {
  title: string;
  description: string;
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): MultipleFileUpload => ({
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});

const DEFAULT_TITLE = "Upload multiple files";

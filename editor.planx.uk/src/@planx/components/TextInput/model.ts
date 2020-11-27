import { MoreInformation, parseMoreInformation } from "../shared";

export type UserData = string;

export interface TextInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
  fn?: string;
  type?: "short" | "long" | "email";
}

export const parseTextInput = (
  data: Record<string, any> | undefined
): TextInput => ({
  title: data?.title || "",
  description: data?.description,
  placeholder: data?.placeholder,
  fn: data?.fn,
  type: data?.type,
  ...parseMoreInformation(data),
});

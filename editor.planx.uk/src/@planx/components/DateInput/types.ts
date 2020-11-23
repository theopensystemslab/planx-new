import { MoreInformation, parseMoreInformation } from "../shared";

// Expected format: YYYY-MM-DD
export type UserData = string;

export interface DateInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
  fn?: string;
  min?: string;
  max?: string;
}

export const parseDateInput = (
  data: Record<string, any> | undefined
): DateInput => ({
  title: data?.title || "",
  description: data?.description,
  placeholder: data?.placeholder,
  fn: data?.fn,
  min: data?.min,
  max: data?.max,
  ...parseMoreInformation(data),
});

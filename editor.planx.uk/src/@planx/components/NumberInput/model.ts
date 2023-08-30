import { MoreInformation, parseMoreInformation } from "../shared";

export interface NumberInput extends MoreInformation {
  title: string;
  description?: string;
  fn?: string;
  units?: string;
}

export type UserData = number;

export const parseNumber = (raw: string): number | null => {
  const parsed = raw === "0" ? 0 : parseFloat(raw);
  if (isNaN(parsed)) {
    return null;
  }
  return parsed;
};

export const parseNumberInput = (
  data: Record<string, any> | undefined,
): NumberInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn || "",
  units: data?.units,
  ...parseMoreInformation(data),
});

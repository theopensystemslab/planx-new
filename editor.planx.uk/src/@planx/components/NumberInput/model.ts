import { MoreInformation, parseMoreInformation } from "../shared";

export interface NumberInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
  fn: string;
  units?: string;
}

export type UserData = number;

export const parseNumber = (raw: string): number | null => {
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) {
    return null;
  }
  return parsed;
};

export const parseNumberInput = (
  data: Record<string, any> | undefined
): NumberInput => ({
  // TODO: improve runtime validation here (joi, io-ts)
  title: data?.title || "",
  description: data?.description,
  placeholder: data?.placeholder,
  fn: data?.fn || "",
  units: data?.units,
  ...parseMoreInformation(data),
});

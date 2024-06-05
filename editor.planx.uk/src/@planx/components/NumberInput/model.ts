import { object, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

export interface NumberInput extends MoreInformation {
  title: string;
  description?: string;
  fn?: string;
  units?: string;
  allowNegatives?: boolean;
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
  allowNegatives: data?.allowNegatives || false,
  ...parseMoreInformation(data),
});

export const numberInputValidationSchema = (input: NumberInput) =>
  string()
    .required("Enter your answer before continuing")
    .test({
      name: "not a number",
      message: (() => {
        if (!input.allowNegatives) {
          return "Enter a positive number";
        }

        return "Enter a number";
      })(),
      test: (value: string | undefined) => {
        if (!value) {
          return false;
        }
        if (!input.allowNegatives && value.startsWith("-")) {
          return false;
        }
        return value === "0" ? true : Boolean(parseNumber(value));
      },
    });

export const validationSchema = (input: NumberInput) =>
  object({
    value: numberInputValidationSchema(input),
  });

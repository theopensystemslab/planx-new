import { object, string } from "yup";

import { BaseNodeData, parseBaseNodeData } from "../shared";
import { FieldValidationSchema } from "../shared/Schema/model";

export interface NumberInput extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
  units?: string;
  allowNegatives?: boolean;
  isInteger?: boolean;
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
  isInteger: data?.isInteger || false,
  ...parseBaseNodeData(data),
});

export const numberInputValidationSchema = ({
  data,
  required,
}: FieldValidationSchema<NumberInput>) =>
  string()
    .when([], {
      is: () => required,
      then: string().required("Enter your answer before continuing"),
      otherwise: string().notRequired(),
    })
    .test({
      name: "not a number",
      message: (() => {
        if (!data.allowNegatives) {
          return "Enter a positive number";
        }

        return "Enter a number";
      })(),
      test: (value?: string) => {
        if (!value) return true;

        if (!data.allowNegatives && value.startsWith("-")) {
          return false;
        }
        return value === "0" ? true : Boolean(parseNumber(value));
      },
    })
    .test({
      name: "check for a whole number",
      message: "Enter a whole number",
      test: (value?: string) => {
        if (!value) return true;

        if (data.isInteger && !Number.isInteger(Number(value))) {
          return false;
        }
        return true;
      },
    });

export const validationSchema = (args: FieldValidationSchema<NumberInput>) =>
  object({
    value: numberInputValidationSchema(args),
  });

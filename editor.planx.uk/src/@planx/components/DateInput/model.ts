import parseISO from "date-fns/parseISO";
import { SchemaOf,string } from "yup";

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

export const dateSchema: (params: {
  min?: string;
  max?: string;
}) => SchemaOf<string> = (params) =>
  string()
    .required()
    .test("valid", "date is not valid", (date: string | undefined) => {
      return Boolean(
        date &&
          // TODO: don't use string equality check here?
          parseISO(date).toString() !== "Invalid Date" &&
          !(params.min && date < params.min) &&
          !(params.max && date > params.max)
      );
    });

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

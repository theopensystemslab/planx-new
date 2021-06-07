import parseISO from "date-fns/parseISO";
import { SchemaOf, string } from "yup";

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

const isDateValid = (date: string) =>
  // possibly replaceable with isValid(parseISO(date))?
  parseISO(date).toString() !== "Invalid Date";

const displayDate = (date: string): string | undefined => {
  if (!isDateValid(date)) {
    return undefined;
  }
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
};

export const dateSchema: (params: {
  min?: string;
  max?: string;
}) => SchemaOf<string> = (params) =>
  string()
    .required()
    .test("valid", "Enter a valid date", (date: string | undefined) => {
      return Boolean(date && isDateValid(date));
    })
    .test({
      name: "too soon",
      message: `Enter a date later than ${
        params.min && displayDate(params.min)
      }`,
      test: (date: string | undefined) => {
        return Boolean(date && !(params.min && date < params.min));
      },
    })
    .test({
      name: "too late",
      message: `Enter a date earlier than ${
        params.max && displayDate(params.max)
      }`,
      test: (date: string | undefined) => {
        return Boolean(date && !(params.max && date > params.max));
      },
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

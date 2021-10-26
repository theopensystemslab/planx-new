import { isValid, parseISO } from "date-fns";
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

export const isDateValid = (date: string) => {
  // make sure we've got DD, MM, & YYYY
  const isComplete = date.split("-").filter((n) => n.length > 0).length === 3;

  return isComplete && isValid(parseISO(date));
};

export const paddedDate = (date: string) => {
  const [year, month, day] = date.split("-");

  // If month and/or year is single-digit, pad it
  const [paddedMonth, paddedDay] = [month, day].map((value) => {
    // Don't add padding if it's just a 0
    if (value === "0") {
      return value;
    }

    if (value.length === 1) {
      return value.padStart(2, "0");
    }

    // If it's already been padded, remove extraneous 0
    if (value.length > 2 && value[0] === "0") {
      return value.slice(1);
    }

    // Otherwise change nothing
    return value;
  });

  return [year, paddedMonth, paddedDay].join("-");
};

const displayDate = (date: string): string | undefined => {
  if (!isDateValid(date)) {
    return undefined;
  }
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
};

export const dateSchema = () => {
  return string().test(
    "valid",
    "Enter a valid date",
    (date: string | undefined) => {
      // test() runs regardless of required status, so don't fail it if it's undefined
      return Boolean(!date || isDateValid(date));
    }
  );
};

export const dateRangeSchema: (params: {
  min?: string;
  max?: string;
}) => SchemaOf<string> = (params) =>
  dateSchema()
    .required("Enter a valid date")
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

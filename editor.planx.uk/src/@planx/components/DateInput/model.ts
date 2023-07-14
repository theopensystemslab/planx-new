import { isValid, parseISO } from "date-fns";
import { object, SchemaOf, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

// Expected format: YYYY-MM-DD
export type UserData = string;

export interface DateInput extends MoreInformation {
  title: string;
  description?: string;
  fn?: string;
  min?: string;
  max?: string;
}

export const isDateValid = (date: string) => {
  // make sure we've got DD, MM, & YYYY
  const isComplete = date.split("-").filter((n) => n.length > 0).length === 3;

  return isComplete && isValid(parseISO(date));
};

export const paddedDate = (
  date: string,
  eventType: string,
): string | undefined => {
  const [year, month, day] = date.split("-");

  // Do not parse if no values given (e.g. deleting a date)
  if (!year && !month && !day) return;

  // If month and/or year is single-digit, pad it
  const [paddedMonth, paddedDay] = [month, day].map((value) => {
    // Don't add padding if it's just a 0
    if (value === "0") {
      return value;
    }

    // If the first number is greater than 3, it cannot be a valid day/month
    // Automatically pad with a 0
    if (parseInt(value) > 3) {
      return value.padStart(2, "0");
    }

    // When the field has been blurred, the user has completed their input
    // If the value is < 10, pad with a 0
    if (eventType === "blur" && value.length === 1) {
      return value.padStart(2, "0");
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
    "Enter a valid date in DD.MM.YYYY format",
    (date: string | undefined) => {
      // test runs regardless of required status, so don't fail it if it's undefined
      return Boolean(!date || isDateValid(date));
    },
  );
};

export const dateRangeSchema: (params: {
  min?: string;
  max?: string;
}) => SchemaOf<string> = (params) =>
  dateSchema()
    .required("Enter a valid date in DD.MM.YYYY format")
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
  data: Record<string, any> | undefined,
): DateInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn,
  min: data?.min,
  max: data?.max,
  ...parseMoreInformation(data),
});

export const editorValidationSchema = () =>
  object({
    min: dateSchema().test({
      name: "Min less than max",
      message: "Min must be less than max",
      test(date: string | undefined) {
        if (!date) return true;
        return date < this.parent.max;
      },
    }),
    max: dateSchema().test({
      name: "Max greater than min",
      message: "Max must be greater than min",
      test(date: string | undefined) {
        if (!date) return true;
        return date > this.parent.min;
      },
    }),
  });

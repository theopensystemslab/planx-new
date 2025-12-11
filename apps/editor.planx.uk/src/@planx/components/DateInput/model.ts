import { isValid, parseISO } from "date-fns";
import { richText } from "lib/yupExtensions";
import { object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";
import { FieldValidationSchema } from "../shared/Schema/model";

// Expected format: YYYY-MM-DD
export type UserData = string;

export interface DateInput extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
  min?: string;
  max?: string;
}

// Normalizes month name to a numeric string (1-12)
const normalizeMonth = (month: string): string => {
  if (!month || /^\d+$/.test(month)) return month;

  const normalized = month.trim().toLowerCase();

  const monthNames = [
    ["january", "jan"],
    ["february", "feb"],
    ["march", "mar"],
    ["april", "apr"],
    ["may", "may"],
    ["june", "jun"],
    ["july", "jul"],
    ["august", "aug"],
    ["september", "sep", "sept"],
    ["october", "oct"],
    ["november", "nov"],
    ["december", "dec"],
  ];

  for (let i = 0; i < monthNames.length; i++) {
    if (monthNames[i].includes(normalized)) {
      return String(i + 1).padStart(2, "0");
    }
  }
  // Return "0" for invalid month names
  if (/[a-z]/.test(normalized)) {
    return "0";
  }

  return normalized;
};

// Normalizes date on submission
export const normalizeDate = (date: string): string => {
  const [year, month, day] = date.split("-");
  const normalizedMonth = normalizeMonth(month);
  return [year, normalizedMonth, day].join("-");
};

const isDateValid = (date: string) => {
  const normalizedDate = normalizeDate(date);
  return isValid(parseISO(normalizedDate));
};

export const paddedDate = (
  date: string,
  eventType: string,
): string | undefined => {
  const [year, month, day] = date.split("-");

  // Do not parse if no values given (e.g. deleting a date)
  if (!year && !month && !day) return;

  // If month and/or day is single-digit, pad it
  const [paddedMonth, paddedDay] = [month, day].map((value, index) => {
    const isMonth = index === 0;

    // only pad month if numeric
    if (isMonth && value && !/^\d+$/.test(value)) {
      return value;
    }

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

export const parseDate = (date?: string) => {
  const [year, month, day] =
    date?.split("-").map((val, i) => {
      const parsed = parseInt(i === 1 ? normalizeMonth(val) : val);
      return isNaN(parsed) ? undefined : parsed;
    }) || [];
  return { year, month, day };
};

/**
 * Validates that a given string is a date in the correct format
 */
export const dateSchema = () => {
  return string()
    .test("missing day", "Date must include a day", (date?: string) => {
      if (!date) return true;

      const { day } = parseDate(date);
      return day !== undefined;
    })
    .test("missing month", "Date must include a month", (date?: string) => {
      if (!date) return true;

      const { month } = parseDate(date);
      return month !== undefined;
    })
    .test("missing year", "Date must include a year", (date?: string) => {
      if (!date) return true;

      const { year } = parseDate(date);
      return year !== undefined;
    })
    .test("invalid day", "Day must be a real day", (date?: string) => {
      if (!date) return true;

      const { day } = parseDate(date);
      return Boolean(day && day <= 31);
    })
    .test("invalid month", "Month must be a real month", (date?: string) => {
      if (!date) return true;

      const { month } = parseDate(date);
      return Boolean(month && month >= 1 && month <= 12);
    })
    .test(
      "valid",
      "Enter a valid date in DD.MM.YYYY format",
      (date: string | undefined) => {
        if (!date) return true;

        // test runs regardless of required status, so don't fail it if it's undefined
        return Boolean(!date || isDateValid(date));
      },
    );
};

/**
 * Validates that date is both valid and fits within the provided min/max
 */
export const dateInputValidationSchema = ({
  data,
  required,
}: FieldValidationSchema<DateInput>) =>
  dateSchema()
    .when([], {
      is: () => required,
      then: dateSchema().required("Enter a valid date in DD.MM.YYYY format"),
      otherwise: dateSchema().notRequired(),
    })
    .test({
      name: "too soon",
      message: `Enter a date later than ${data.min && displayDate(data.min)}`,
      test: (date) => {
        if (!date) return true;

        return Boolean(date && !(data.min && date < data.min));
      },
    })
    .test({
      name: "too late",
      message: `Enter a date earlier than ${data.max && displayDate(data.max)}`,
      test: (date) => {
        if (!date) return true;

        return Boolean(date && !(data.max && date > data.max));
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
  ...parseBaseNodeData(data),
});

export const editorValidationSchema: SchemaOf<DateInput> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      fn: string(),
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
    }),
  );

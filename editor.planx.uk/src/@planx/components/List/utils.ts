import { QuestionField, Schema, UserResponse } from "./model";

/**
 * In the case of "question" fields, ensure the displayed value reflects option "text", rather than "val" as recorded in passport
 * @param value - the `val` or `text` of an Option defined in the schema's fields
 * @param schema - the Schema object
 * @returns string - the `text` for the given value `val`, or the original value
 */
export function formatSchemaDisplayValue(value: string, schema: Schema) {
  const questionFields = schema.fields.filter(
    (field) => field.type === "question",
  ) as QuestionField[];
  const matchingField = questionFields?.find((field) =>
    field.data.options.some((option) => option.data.val === value),
  );
  const matchingOption = matchingField?.data.options.find(
    (option) => option.data.val === value,
  );

  // If we found a "val" match, return its text, else just return the value as passed in
  return matchingOption?.data?.text || value;
}

/**
 * If the schema includes a field that sets fn = "identicalUnits", sum of total units
 * @param fn - passport key of current List
 * @param passportData - default passport data format for the List
 * @returns - sum of all units, or 0 if field not set
 */
export function sumIdenticalUnits(
  fn: string,
  passportData: Record<string, UserResponse[]>,
): number {
  let sum = 0;
  passportData[`${fn}`].map((item) => (sum += parseInt(item?.identicalUnits)));
  return sum;
}

/**
 * If the schema includes fields that set fn = "development" and fn = "identicalUnits", sum of total units by development option "val"
 * @param fn - passport key of current List
 * @param passportData - default passport data format for the List
 * @returns - sum of all units by development type, or empty object if fields not set
 */
export function sumIdenticalUnitsByDevelopmentType(
  fn: string,
  passportData: Record<string, UserResponse[]>,
): Record<string, number> {
  // Sum identical units by development type (read option `val` from Schema in future?)
  const baseSums: Record<string, number> = {
    newBuild: 0,
    changeOfUseFrom: 0,
    changeOfUseTo: 0,
  };
  passportData[`${fn}`].map(
    (item) =>
      (baseSums[`${item?.development}`] += parseInt(item?.identicalUnits)),
  );

  // Format property names for passport, and filter out any entries with default sum = 0
  const formattedSums: Record<string, number> = {};
  Object.entries(baseSums).forEach(([k, v]) => {
    if (v > 0) {
      formattedSums[`${fn}.total.units.development.${k}`] = v;
    }
  });

  return formattedSums;
}

/**
 * Flattens nested object so we can output passport variables like `{listFn}.{itemIndexAsText}.{fieldFn}`
 *   Adapted from https://gist.github.com/penguinboy/762197
 */
export function flatten<T extends Record<string, any>>(
  object: T,
  path: string | null = null,
  separator = ".",
): T {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const value = object[key];

    // If the key is a whole number, convert to text before setting newPath
    //   eg because Calculate/MathJS cannot automate passport variables with number segments
    if (/^-?\d+$/.test(key)) {
      key = convertNumberToText(parseInt(key) + 1);
    }

    const newPath = [path, key].filter(Boolean).join(separator);

    const isObject = [
      typeof value === "object",
      value !== null,
      !(Array.isArray(value) && value.length === 0),
    ].every(Boolean);

    return isObject
      ? { ...acc, ...flatten(value, newPath, separator) }
      : { ...acc, [newPath]: value };
  }, {} as T);
}

const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];
const tens = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];
const teens = [
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

function convertTens(num: number): string {
  if (num < 10) {
    return ones[num];
  } else if (num >= 10 && num < 20) {
    return teens[num - 10];
  } else {
    // format as compound string - eg "thirtyfour" instead of "thirty four"
    return tens[Math.floor(num / 10)] + ones[num % 10];
  }
}

/**
 * Convert a whole number up to 99 to a spelled-out word (eg 34 => 'thirtyfour')
 *   Adapted from https://stackoverflow.com/questions/5529934/javascript-numbers-to-words
 */
function convertNumberToText(num: number): string {
  if (num == 0) {
    return "zero";
  } else {
    return convertTens(num);
  }
}

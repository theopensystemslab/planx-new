// Flattens nested object so we can output passport variables like `{listFn}.{itemIndexAsText}.{fieldFn}`
//   Adapted from https://gist.github.com/penguinboy/762197
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

// Convert a whole number up to 99 to a spelled-out word (eg 34 => 'thirtyfour')
//   Adapted from https://stackoverflow.com/questions/5529934/javascript-numbers-to-words
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

function convertNumberToText(num: number): string {
  if (num == 0) {
    return "zero";
  } else {
    return convertTens(num);
  }
}

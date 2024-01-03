import { isObject } from "lodash";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

// Setup JSDOM and DOMPurify
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

/**
 * Function which returns -
 *   - true for valid data
 *   - false for invalid data
 */
type Validator = (input: unknown) => boolean;

/**
 * Recursively iterate over an object, checking is validator callback condition is met
 * Fails fast - will return false once first invalid value is encountered
 */
export const isObjectValid = (
  input: unknown,
  validator: Validator,
): boolean => {
  if (Array.isArray(input)) {
    return input.every((child) => isObjectValid(child, validator));
  }

  if (isObject(input)) {
    return Object.values(input).every((child) =>
      isObjectValid(child, validator),
    );
  }

  return validator(input);
};

export const isCleanHTML = (input: unknown): boolean => {
  // Skip validation for non-string values
  if (typeof input !== "string") return true;

  const cleanHTML = DOMPurify.sanitize(input, { ADD_ATTR: ["target"] });
  // DOMPurify has not removed any attributes or values
  const isClean =
    cleanHTML.length === input.length ||
    unescapeHTML(cleanHTML).length === unescapeHTML(input).length;

  if (!isClean) {
    console.log("CLEAN HTML: ", cleanHTML);
    console.log("INPUT HTML: ", input);
    console.log("UNESCAPED HTML: ", unescapeHTML(input));
  }
  return isClean;
};

const unescapeHTML = (input: string): string =>
  input
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ");

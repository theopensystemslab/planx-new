import isObject from "lodash/isObject.js";
import { JSDOM } from "jsdom";
import createDOMPurify, { type WindowLike } from "dompurify";
import he from "he";
import { reportError } from "../../../pay/helpers.js";

// Setup JSDOM and DOMPurify
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as unknown as WindowLike);

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
    he.decode(cleanHTML).length === he.decode(input).length;

  if (!isClean) logUncleanHTMLError(input, cleanHTML);

  return isClean;
};

/**
 * Explicity log error when unsafe HTML is encountered
 * This is very likely a content / sanitation error as opposed to a security issue
 * Logging this should help us identify and resolve these
 */
const logUncleanHTMLError = (input: string, cleanHTML: string) => {
  reportError({
    error: `Warning: Unclean HTML submitted!`,
    context: {
      input,
      cleanHTML,
    },
  });
};

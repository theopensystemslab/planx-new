import isObject from "lodash/isObject.js";
import createDOMPurify, { type WindowLike } from "dompurify";
import he from "he";
import { JSDOM } from "jsdom";
import { reportError } from "../../../pay/helpers.js";

export class HTMLSanitiser {
  private readonly dom: JSDOM;
  private readonly purifier: ReturnType<typeof createDOMPurify>;

  constructor() {
    this.dom = new JSDOM("");
    this.purifier = createDOMPurify(this.dom.window as unknown as WindowLike);
  }

  sanitise(input: string): string {
    return this.purifier.sanitize(input, { ADD_ATTR: ["target"] });
  }

  close(): void {
    this.dom.window.close();
  }
}

/**
 * Function which returns -
 *   - true for valid data
 *   - false for invalid data
 */
type Validator = (input: unknown) => boolean;

/**
 * Recursively iterate over an object, checking the validator callback condition is met
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

/**
 * Build a clean-HTML validator bound to a per-request sanitiser
 */
export const makeIsCleanHTML =
  (purifier: HTMLSanitiser): Validator =>
  (input: unknown): boolean => {
    // Skip validation for non-string values
    if (typeof input !== "string") return true;

    // Only run sanitation on potential HTML (rich text), skip for plain strings
    const isHTMLCandidate = input.includes("<") || input.includes("&");
    if (!isHTMLCandidate) return true;

    const cleanHTML = purifier.sanitise(input);

    // Sanitiser has not removed any attributes or values
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

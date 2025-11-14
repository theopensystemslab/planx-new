import { REQUIRED_GOVPAY_METADATA } from "../model";
import { FormikGovPayMetadata } from "./GovPayMetadataSection";

/**
 * Helper method to handle Formik errors in arrays
 * Required as errors can be at array-level or field-level and the useFormikContext hook cannot correctly type infer this from the validation schema
 * Docs: https://formik.org/docs/api/fieldarray#fieldarray-validation-gotchas
 */
export const parseError = (
  errors: FormikGovPayMetadata,
  index: number,
): string | undefined => {
  // No errors
  if (!errors) return;

  // Array-level error - handled at a higher level
  if (typeof errors === "string") return;

  // No error for this field
  if (!errors[index]) return;

  // Specific field-level error
  return errors[index].key || errors[index].value;
};

/**
 * Helper method to handle Formik "touched" in arrays
 * Please see parseError() for additional context
 */
export const parseTouched = (
  touched: string | undefined | FormikGovPayMetadata,
  index: number,
): string | undefined => {
  // No errors
  if (!touched) return;

  // Array-level error - handled at a higher level
  if (typeof touched === "string") return;

  // No error for this field
  if (!touched[index]) return;

  // Specific field-level error
  return touched[index].key && touched[index].value;
};

/**
 * Disable required fields so they cannot be edited
 * Only disable first instance, otherwise any field beginning with a required field will be disabled, and user will not be able to fix their mistake as the delete icon is also disabled
 */
export const isFieldDisabled = (key: string, index: number) =>
  REQUIRED_GOVPAY_METADATA.includes(key) &&
  index === REQUIRED_GOVPAY_METADATA.indexOf(key);

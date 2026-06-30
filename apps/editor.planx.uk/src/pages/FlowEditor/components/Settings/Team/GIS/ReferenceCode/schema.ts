import { object, type SchemaOf, string } from "yup";

import type { ReferenceCodeFormValues } from "./types";

export const validationSchema: SchemaOf<ReferenceCodeFormValues> =
  object().shape({
    referenceCode: string()
      .required("Enter a reference code")
      .test("is-valid-ref-code", "Invalid code format", function (value) {
        if (!value) return false;

        // If the code includes a hyphen, treat it as a reference code for a Local Planning Group
        // e.g. Greater Cambridgeshire Shared Planning Local Planning Group (https://www.planning.data.gov.uk/entity/62009)
        if (value.includes("-")) {
          const lpgRegex = /^[A-Z]{3,5}-[A-Z]{3,5}$/;
          return lpgRegex.test(value)
            || this.createError({ message: "Invalid format for Local Planning Group reference code. These must match the format ABC-DEF" });
        }

        // Otherwise, treat it as a standard Local Planning Authority reference code
        const lpaRegex = /^[A-Z]{3,5}$/;
        return lpaRegex.test(value)
          || this.createError({ message: "Invalid format for Local Planning Authority reference code. Code must be between 3 and 5 characters long" });
      }),
  });

export const defaultValues: ReferenceCodeFormValues = {
  referenceCode: "",
};

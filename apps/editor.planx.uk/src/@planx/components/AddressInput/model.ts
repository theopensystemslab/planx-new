import type { Address } from "@opensystemslab/planx-core/types";
import { richText } from "lib/yupExtensions";
import { parse as parsePostcode } from "postcode";
import type { SchemaOf } from "yup";
import { object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

const UK_COUNTRY_VARIANTS = new Set([
  "uk",
  "u k",
  "united kingdom",
  "great britain",
  "gb",
  "england",
  "scotland",
  "wales",
  "northern ireland",
]);

export const isUKCountry = (value?: string): boolean =>
  value
    ? UK_COUNTRY_VARIANTS.has(value.toLowerCase().replace(/[.]/g, ""))
    : true; // assuming that if the user leaves the optional 'Country' field blank then it's UK

export const addressValidationSchema = (): SchemaOf<Address> =>
  object({
    line1: string().trim().required("Enter the first line of an address"),
    line2: string(),
    town: string().trim().required("Enter a town"),
    county: string(),
    postcode: string()
      .trim()
      .required("Enter a postcode")
      .when("country", {
        is: (value: string) => isUKCountry(value),
        then: (schema) =>
          schema
            .required("Enter a postcode")
            .test(
              "valid-uk-postcode",
              "Enter a valid UK postcode or specify a different country below",
              (value) => Boolean(value && parsePostcode(value).valid),
            ),
        otherwise: (schema) => schema.notRequired(),
      }),
    country: string(),
  });

export interface AddressInput extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
}

export const parseAddressInput = (
  data: Record<string, any> | undefined,
): AddressInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});

export const formatAsSingleLineAddress = (address: Address) =>
  Object.values(address).filter(Boolean).join(", ");

export const editorValidationSchema: SchemaOf<AddressInput> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      fn: string().nullable().required(),
    }),
  );

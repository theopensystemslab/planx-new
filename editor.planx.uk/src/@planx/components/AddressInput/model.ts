import { Address, Value } from "@opensystemslab/planx-core/types";
import { richText } from "lib/yupExtensions";
import type { SchemaOf } from "yup";
import { object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export const addressValidationSchema = (): SchemaOf<Address> =>
  object({
    line1: string().trim().required("Enter the first line of an address"),
    line2: string(),
    town: string().trim().required("Enter a town"),
    county: string(),
    postcode: string().trim().required("Enter a postcode"),
    country: string(),
  });

export interface AddressInput extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
  autoAnswer?: Value;
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

export const validationSchema: SchemaOf<AddressInput> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      fn: string().nullable().required(),
      autoAnswer: addressValidationSchema().nullable(),
    }),
  );

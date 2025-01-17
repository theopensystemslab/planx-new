import { Address } from "@opensystemslab/planx-core/types";
import type { SchemaOf } from "yup";
import { object, string } from "yup";

import { BaseNodeData, parseBaseNodeData } from "../shared";

export const addressValidationSchema = (): SchemaOf<Address> =>
  object({
    line1: string().required("Enter the first line of an address"),
    line2: string(),
    town: string().required("Enter a town"),
    county: string(),
    postcode: string().required("Enter a postcode"),
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

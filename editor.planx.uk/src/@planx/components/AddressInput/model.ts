import type { SchemaOf } from "yup";
import { object, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

export type Address = {
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
  country?: string;
};

export const userDataSchema: SchemaOf<Address> = object({
  line1: string().required("Enter the first line of an address"),
  line2: string(),
  town: string().required("Enter a town"),
  county: string(),
  postcode: string().required("Enter a postcode"),
  country: string(),
});

export interface AddressInput extends MoreInformation {
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
  ...parseMoreInformation(data),
});

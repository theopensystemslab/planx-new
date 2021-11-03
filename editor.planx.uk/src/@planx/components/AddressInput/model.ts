import type { SchemaOf } from "yup";
import { object, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

export type UserData = {
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
};

export const userDataSchema: SchemaOf<UserData> = object({
  line1: string().required("Line 1 is required"),
  line2: string(),
  town: string().required("Town is required"),
  county: string(),
  postcode: string().required("Postal code is required"),
});

export interface AddressInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
  fn?: string;
}

export const parseAddressInput = (
  data: Record<string, any> | undefined
): AddressInput => ({
  title: data?.title || "",
  description: data?.description,
  placeholder: data?.placeholder,
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});

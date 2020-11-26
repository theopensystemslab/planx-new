import { MoreInformation, parseMoreInformation } from "../shared";

export type UserData = {
  line1: string;
  line2: string;
  town: string;
  county: string;
  postcode: string;
};

export interface AddressInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
  fn: string;
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

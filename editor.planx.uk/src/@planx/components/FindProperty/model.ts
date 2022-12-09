import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindProperty extends MoreInformation {
  title: string;
  description: string;
  allowNewAddresses?: boolean;
}

export const parseFindProperty = (
  data: Record<string, any> | undefined
): FindProperty => ({
  title: data?.title || "",
  description: data?.description || "",
  allowNewAddresses: data?.allowNewAddresses || false,
  ...parseMoreInformation(data),
});

export interface SiteAddress {
  uprn: string;
  blpu_code: string;
  latitude: number;
  longitude: number;
  organisation: string | null;
  sao: string | null;
  pao: string;
  street: string;
  town: string;
  postcode: string;
  x: number;
  y: number;
  planx_description: string;
  planx_value: string;
  single_line_address: string;
  title: string;
  source?: "Ordnance Survey AddressBase Premium";
}

export interface NewAddress {
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  title: string;
  source?: "User input";
}

export const DEFAULT_TITLE = "Find the property" as const;

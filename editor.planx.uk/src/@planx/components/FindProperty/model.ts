import type { SchemaOf } from "yup";
import { object, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindProperty extends MoreInformation {
  title: string;
  description: string;
  allowNewAddresses?: boolean;
  newAddressTitle?: string;
  newAddressDescription?: string;
}

export const parseFindProperty = (
  data: Record<string, any> | undefined
): FindProperty => ({
  title: data?.title || "",
  description: data?.description || "",
  allowNewAddresses: data?.allowNewAddresses || false,
  newAddressTitle: data?.newAddressTitle || "",
  newAddressDescription: data?.newAddressDescription || "",
  ...parseMoreInformation(data),
});

// Minimum-required address details if proposing a new non-UPRN address
//   these fields also satisfy component dependencies like DrawBoundary & PlanningConstraints
export interface MinimumSiteAddress {
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  title: string;
  source: "os" | "proposed" | string;
}

// Full SiteAddress reflects selecting a known address from the OS Places API "LPI" datasource
export interface SiteAddress extends MinimumSiteAddress {
  uprn?: string;
  blpu_code?: string;
  organisation?: string | null;
  sao?: string | null;
  pao?: string;
  street?: string;
  town?: string;
  postcode?: string;
  single_line_address?: string;
  planx_description?: string; // joined via table blpu_codes
  planx_value?: string; // joined via table blpu_codes
}

export type ProposedAddressInputs = {
  siteDescription: string;
};

export const userDataSchema: SchemaOf<ProposedAddressInputs> = object({
  siteDescription: string().required(
    "Enter a site description to proceed. For example, `Land at...`"
  ),
});

export const DEFAULT_TITLE = "Find the property" as const;
export const DEFAULT_NEW_ADDRESS_TITLE = "Propose a new address" as const;

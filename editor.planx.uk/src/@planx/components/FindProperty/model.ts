import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindProperty extends MoreInformation {
  title: string;
  description: string;
  allowNewAddresses?: boolean;
  newAddressTitle?: string;
  newAddressDescription?: string;
  newAddressDescriptionLabel?: string;
}

export const parseFindProperty = (
  data: Record<string, any> | undefined,
): FindProperty => ({
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  allowNewAddresses: data?.allowNewAddresses || false,
  newAddressTitle: data?.newAddressTitle || DEFAULT_NEW_ADDRESS_TITLE,
  newAddressDescription:
    data?.newAddressDescription || DEFAULT_NEW_ADDRESS_DESCRIPTION,
  newAddressDescriptionLabel:
    data?.newAddressDescriptionLabel || DEFAULT_NEW_ADDRESS_LABEL,
  ...parseMoreInformation(data),
});

// Addresses can come from two sources:
//   1. Ordnance Survey provides _known_ addresses that have a UPRN
//   2. Applicants propose _new_ addresses that do not yet have a UPRN
type AddressSources = "os" | "proposed";

// Minimum-required address details if proposing an address
//   these fields also satisfy component dependencies like DrawBoundary & PlanningConstraints
export interface MinimumSiteAddress {
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  title: string;
  source: AddressSources;
}

// Full SiteAddress reflects selecting a record from the OS Places API "LPI" datasource
export interface SiteAddress extends MinimumSiteAddress {
  uprn?: string;
  usrn?: string;
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

export const DEFAULT_TITLE = "Find the property" as const;
export const DEFAULT_NEW_ADDRESS_TITLE =
  "Click or tap at where the property is on the map and name it below" as const;
export const DEFAULT_NEW_ADDRESS_DESCRIPTION =
  "You will need to select a location and provide a name to continue" as const;
export const DEFAULT_NEW_ADDRESS_LABEL = "Name the site" as const;

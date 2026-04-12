import { richText } from "lib/yupExtensions";
import { boolean, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export enum FindPropertyUserAction {
  Existing = "Selected an existing address",
  New = "Proposed a new address",
}

export const PASSPORT_COMPONENT_ACTION_KEY = "findProperty.action";

export interface FindProperty extends BaseNodeData {
  title: string;
  description: string;
  allowNewAddresses?: boolean;
  newAddressFirstPage?: boolean;
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
  newAddressFirstPage: data?.newAddressFirstPage || false,
  newAddressTitle: data?.newAddressTitle || DEFAULT_NEW_ADDRESS_TITLE,
  newAddressDescription:
    data?.newAddressDescription || DEFAULT_NEW_ADDRESS_DESCRIPTION,
  newAddressDescriptionLabel:
    data?.newAddressDescriptionLabel || DEFAULT_NEW_ADDRESS_LABEL,
  ...parseBaseNodeData(data),
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
  sao?: string;
  saoEnd?: string;
  pao?: string;
  paoEnd?: string;
  street?: string;
  town?: string;
  postcode?: string;
  ward?: string;
  parish?: string;
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

export const validationSchema: SchemaOf<FindProperty> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      allowNewAddresses: boolean(),
      newAddressFirstPage: boolean(),
      newAddressTitle: string(),
      newAddressDescription: richText(),
      newAddressDescriptionLabel: string(),
    }),
  );

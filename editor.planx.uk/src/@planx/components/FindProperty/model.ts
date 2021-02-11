import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindProperty extends MoreInformation {
  title: string;
  description: string;
}

export const parseFindProperty = (
  data: Record<string, any> | undefined
): FindProperty => ({
  // TODO: improve runtime validation here (joi, io-ts)
  title: data?.title || "",
  description: data?.description || "",
  ...parseMoreInformation(data),
});

export interface Address {
  UPRN: number;
  team: string;
  sao: string | null;
  pao: string;
  organisation: string | null;
  street: string;
  town: string;
  postcode: string;
  blpu_code: string;
  planx_description: string;
  planx_value: string;
  x: number;
  y: number;
}

export const DEFAULT_TITLE = "Find the property" as const;

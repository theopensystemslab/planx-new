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
  uprn: number;
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
}

export const DEFAULT_TITLE = "Find the property" as const;

import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindProperty extends MoreInformation {
  title: string;
  description: string;
}

export const parseFindProperty = (
  data: Record<string, any> | undefined
): FindProperty => ({
  title: data?.title || "",
  description: data?.description || "",
  ...parseMoreInformation(data),
});

export interface Address {
  uprn: string;
  blpu_code: string;
  latitude: string;
  longitude: string;
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
}

export const DEFAULT_TITLE = "Find the property" as const;

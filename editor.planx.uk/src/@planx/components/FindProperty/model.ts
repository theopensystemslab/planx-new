import { MoreInformation, parseMoreInformation } from "../shared";

export interface FindProperty extends MoreInformation {}

export const parseFindProperty = (
  data: Record<string, any> | undefined
): FindProperty => ({
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

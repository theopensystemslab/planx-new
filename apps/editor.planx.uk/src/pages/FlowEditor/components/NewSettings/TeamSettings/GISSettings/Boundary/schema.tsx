import { object, type SchemaOf, string } from "yup";

import type { BoundaryFormValues } from "./types";

const planningDataURLRegex =
  /^https:\/\/www\.planning\.data\.gov\.uk\/entity\/\d{1,7}$/;

// Casting to avoid validating entire GeoJSON spec
export const validationSchema = object().shape({
  boundaryUrl: string()
    .matches(
      planningDataURLRegex,
      "Enter a boundary URL in the correct format, https://www.planning.data.gov.uk/entity/1234567",
    )
    .required("Enter a boundary URL"),
  boundaryBBox: object(),
}) as unknown as SchemaOf<BoundaryFormValues>;

export const defaultValues: BoundaryFormValues = {
  boundaryUrl: "",
  boundaryBBox: undefined,
};

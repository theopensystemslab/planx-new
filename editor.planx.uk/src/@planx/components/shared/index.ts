import trim from "lodash/trim";

export interface MoreInformation {
  howMeasured?: string;
  policyRef?: string;
  info?: string;
  notes?: string;
  definitionImg?: string;
}

export const parseMoreInformation = (
  data: Record<string, any> | undefined,
): MoreInformation => ({
  notes: data?.notes,
  definitionImg: data?.definitionImg,
  howMeasured: data?.howMeasured,
  policyRef: data?.policyRef,
  info: data?.info,
});

export interface Option {
  id: string;
  data: {
    description?: string;
    flag?: string;
    img?: string;
    text: string;
    val?: string;
  };
}

export const parseFormValues = (ob: any, defaultValues = {}) =>
  ob.reduce((acc: any, [k, v]: any) => {
    if (typeof v === "string") {
      // Remove trailing lines (whitespace)
      // and non-ASCII characters https://stackoverflow.com/a/44472084
      v = trim(v).replace(/[\u{0080}-\u{FFFF}]/gu, "");
      // don't store empty fields
      if (v) acc[k] = v;
    } else if (Array.isArray(v)) {
      // if it's an array (i.e. options)
      acc[k] = v
        // only store fields that have values
        .map((o) => parseFormValues(Object.entries(o)))
        // don't store options with no values
        .filter((o) => Object.keys(o).length > 0);
    } else {
      // it's a number or boolean etc
      acc[k] = v;
    }
    return acc;
  }, defaultValues);

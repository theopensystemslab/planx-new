import trim from "lodash/trim";

export interface IEditor {
  headerTextField?: string;
  whyItMatters?: string;
  policyField?: string;
  definition?: string;
  notes?: string;
}

export const parseFormValues = (ob, defaultValues = {}) =>
  ob.reduce((acc, [k, v]) => {
    if (typeof v === "string") {
      // Remove trailing lines (whitespace)
      // and non-ASCII characters https://stackoverflow.com/a/24231346
      v = trim(v).replace(/[^ -~]+/g, "");
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

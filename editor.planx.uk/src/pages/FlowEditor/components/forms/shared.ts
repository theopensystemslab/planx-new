export interface IEditor {
  headerTextField?: string;
  whyItMatters?: string;
  policyField?: string;
  definition?: string;
  notes?: string;
}

export const parseFormValues = (ob, defaultValues = {}) =>
  ob.reduce((acc, [k, v]) => {
    // don't store empty fields
    if (v !== "") {
      acc[k] = v;
    }
    // if it's an array (i.e. options)
    if (Array.isArray(v)) {
      acc[k] = v
        // only store fields that have values
        .map((o) => parseFormValues(Object.entries(o)))
        // don't store options with no values
        .filter((o) => Object.keys(o).length > 0);
    }
    return acc;
  }, defaultValues);

import type { TestConfig } from "yup";

import type { AnyOption, Option } from "../Option/model";

export const hasUniqueLabels = (options: AnyOption[]): boolean => {
  const labels = options.map(({ data }) => data.text);
  return new Set(labels).size === options.length;
};

export const hasUniqueOptions = (options: AnyOption[]): boolean => {
  const labels = options.map(
    ({ data }) => `${data.text}_${data.description?.trim() ?? ""}`,
  );
  return new Set(labels).size === options.length;
};

export const uniqueLabelsTest: TestConfig<Option[]> = {
  name: "uniqueLabels",
  test: function (options) {
    if (!options) return true;
    if (hasUniqueLabels(options)) return true;
    return this.createError({
      path: "options",
      message: "Options must have unique labels",
    });
  },
};

export const uniqueOptionsTest: TestConfig<Option[]> = {
  name: "uniqueOptions",
  test: function (options) {
    if (!options) return true;
    if (hasUniqueOptions(options)) return true;
    return this.createError({
      path: "options",
      message:
        "Options must have unique labels, or unique descriptions if labels are conditionally shown",
    });
  },
};

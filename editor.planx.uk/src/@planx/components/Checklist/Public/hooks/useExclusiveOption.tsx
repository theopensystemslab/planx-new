import { FormikProps } from "formik";

import { Option } from "../../../shared";

export const useExclusiveOption = (
  exclusiveOptions: Option[],
  formik: FormikProps<{ checked: Array<string> }>
) => {
  const [exclusiveOrOption] = exclusiveOptions;

  const exclusiveOptionIsChecked =
    exclusiveOrOption && formik.values.checked.includes(exclusiveOrOption.id);

  const toggleExclusiveCheckbox = (checkboxId: string) => {
    return exclusiveOptionIsChecked ? [] : [checkboxId];
  };

  return {
    exclusiveOrOption,
    exclusiveOptionIsChecked,
    toggleExclusiveCheckbox,
  };
};

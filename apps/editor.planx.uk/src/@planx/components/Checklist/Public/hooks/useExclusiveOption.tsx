import { FormikProps } from "formik";

import { Option } from "../../../shared";
import { Group } from "../../model";

export const useExclusiveOption = (
  exclusiveOptions: Option[],
  formik: FormikProps<{ checked: Array<string> }>,
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

export const useExclusiveOptionInGroupedChecklist = (
  exclusiveOptions: Group<Option>[],
  formik: FormikProps<{ checked: Array<string> }>,
) => {
  const [exclusiveOrOptionGroup] = exclusiveOptions;

  const exclusiveOptionIsChecked =
    exclusiveOrOptionGroup &&
    formik.values.checked.includes(exclusiveOrOptionGroup.children[0].id);

  const toggleExclusiveCheckbox = (checkboxId: string) => {
    return exclusiveOptionIsChecked ? [] : [checkboxId];
  };

  return {
    exclusiveOrOptionGroup,
    exclusiveOptionIsChecked,
    toggleExclusiveCheckbox,
  };
};

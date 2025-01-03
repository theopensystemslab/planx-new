import { FormikProps } from "formik";

import { Option } from "../../../shared";

export const useExclusiveOption = (
  exclusiveOptions: Option[],
  formik: FormikProps<{ checked: Array<string> }>
) => {
  const [exclusiveOrOption] = exclusiveOptions;

  const exclusiveOptionIsChecked =
    exclusiveOrOption && formik.values.checked.includes(exclusiveOrOption.id);

  const toggleExclusiveCheckbox = (checkboxId: string): Array<string> => {
    return exclusiveOptionIsChecked ? [] : [checkboxId];
  };

  return {
    exclusiveOrOption,
    exclusiveOptionIsChecked,
    toggleExclusiveCheckbox,
  };
};

export const useExclusiveOptionInGroupedChecklists = (
  exclusiveOptions: Option[],
  checklistGroupTitle: string,
  formik: FormikProps<{ checked: Record<string, Array<string>> }>
) => {
  const [exclusiveOrOption] = exclusiveOptions;

  const exclusiveOptionIsChecked =
    exclusiveOrOption &&
    formik.values.checked[checklistGroupTitle] &&
    formik.values.checked[checklistGroupTitle].includes(exclusiveOrOption.id);

  const toggleExclusiveCheckbox = (
    checkboxId: string
  ): Record<string, Array<string>> => {
    const newCheckedIds = formik.values.checked;
    if (exclusiveOptionIsChecked) {
      if (checklistGroupTitle in formik.values.checked) {
        // empty the array in this checklist section only
        newCheckedIds[checklistGroupTitle] = [];
      }
    } else {
      // add in the checkboxId at this index
      newCheckedIds[checklistGroupTitle] = [checkboxId];
    }
    return newCheckedIds;
  };

  return {
    exclusiveOrOption,
    exclusiveOptionIsChecked,
    toggleExclusiveCheckbox,
  };
};

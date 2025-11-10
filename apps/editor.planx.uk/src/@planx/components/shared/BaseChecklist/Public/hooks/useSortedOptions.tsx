import { Option } from "@planx/components/Option/model";
import {
  getFlatOptions,
  getLayout,
  Group,
} from "@planx/components/shared/BaseChecklist/model";
import { FormikProps } from "formik";

export const useSortedOptions = (
  options: Option[] | undefined,
  groupedOptions: Group<Option>[] | undefined,
  formik: FormikProps<{ checked: Array<string> }>,
) => {
  const setCheckedFieldValue = (optionIds: string[]) => {
    const sortedCheckedIds = sortCheckedIds(optionIds);
    formik.setFieldValue("checked", sortedCheckedIds);
  };

  const layout = getLayout({ options, groupedOptions });
  const flatOptions = getFlatOptions({ options, groupedOptions });

  const sortCheckedIds = (ids: string[]): string[] => {
    const originalIds = flatOptions.map((cb) => cb.id);
    return ids.sort((a, b) => originalIds.indexOf(a) - originalIds.indexOf(b));
  };

  return {
    setCheckedFieldValue,
    layout,
  };
};

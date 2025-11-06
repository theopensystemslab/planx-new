import { Option } from "@planx/components/Option/model";
import { Group } from "@planx/components/shared/BaseChecklist/model";
import { useStore } from "pages/FlowEditor/lib/store";
import { FormikHookReturn } from "types";

import { ChecklistWithOptions } from "../../model";

export const useCurrentOptions = (
  formik: FormikHookReturn<ChecklistWithOptions>,
) => {
  const schema = useStore().getFlowSchema()?.options;

  const currentOptions: Option[] | undefined =
    formik.values.options ||
    formik.values.groupedOptions
      ?.map((group: Group<Option>) => group.children)
      ?.flat();

  const currentOptionVals = currentOptions?.map((option) => option.data?.val);

  return { currentOptions, schema, currentOptionVals };
};

import { Group } from "@planx/components/Checklist/model";
import { useStore } from "pages/FlowEditor/lib/store";
import { FormikHookReturn } from "types";

import { Option } from "../../../shared";

export const useCurrentOptions = (formik: FormikHookReturn) => {
  const schema = useStore().getFlowSchema()?.options;

  const currentOptions: Option[] | undefined =
    formik.values.options ||
    formik.values.groupedOptions
      ?.map((group: Group<Option>) => group.children)
      ?.flat();

  const currentOptionVals = currentOptions?.map((option) => option.data?.val);

  return { currentOptions, schema, currentOptionVals };
};

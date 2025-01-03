import { Group } from "@planx/components/Checklist/model";
import { useStore } from "pages/FlowEditor/lib/store";
import { FormikHookReturn } from "types";

import { Option } from "../../../shared";

export const useInitialOptions = (formik: FormikHookReturn) => {
  const schema = useStore().getFlowSchema()?.options;

  const initialOptions: Option[] | undefined =
    formik.initialValues.options ||
    formik.initialValues.groupedOptions
      ?.map((group: Group<Option>) => group.children)
      ?.flat();
      
  const initialOptionVals = initialOptions?.map((option) => option.data?.val);

  return { initialOptions, schema, initialOptionVals };
};

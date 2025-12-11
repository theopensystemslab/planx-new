import { ChecklistWithOptions } from "@planx/components/Checklist/model";
import { ResponsiveChecklistWithOptions } from "@planx/components/ResponsiveChecklist/model";
import { useStore } from "pages/FlowEditor/lib/store";
import { FormikHookReturn } from "types";

export const useCurrentOptions = <
  T extends ChecklistWithOptions | ResponsiveChecklistWithOptions,
>(
  formik: FormikHookReturn<T>,
) => {
  const schema = useStore().getFlowSchema()?.options;

  const currentOptions =
    formik.values.options ||
    formik.values.groupedOptions?.map((group) => group.children)?.flat();

  const currentOptionVals = currentOptions?.map((option) => option.data?.val);

  return { currentOptions, schema, currentOptionVals };
};

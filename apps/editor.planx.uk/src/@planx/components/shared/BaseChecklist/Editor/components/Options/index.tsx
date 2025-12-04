import { ComponentType } from "@opensystemslab/planx-core/types";
import { AnyOption } from "@planx/components/Option/model";
import { DEFAULT_RULE } from "@planx/components/ResponsiveChecklist/model";
import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { partition } from "lodash";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import type { AnyChecklist } from "../../../model";
import { useCurrentOptions } from "../../../Public/hooks/useInitialOptions";
import { ExclusiveOrOptionManager } from "./ExclusiveOrOptionManager";
import { GroupedOptions } from "./GroupedOptions";
import ChecklistOptionsEditor from "./OptionsEditor";

export const Options = <T extends AnyChecklist>({
  type,
  formik,
  disabled,
  isTemplatedNode,
}: {
  type: ComponentType.Checklist | ComponentType.ResponsiveChecklist;
  formik: FormikHookReturn<T>;
  disabled?: boolean;
  isTemplatedNode?: boolean;
}) => {
  const [exclusiveOptions, nonExclusiveOptions] = partition<AnyOption>(
    formik.values.options,
    (option) => option.data.exclusive,
  );

  const exclusiveOrOptionManagerShouldRender = nonExclusiveOptions.length > 0;

  const { schema, currentOptionVals } = useCurrentOptions(formik);

  return (
    <ModalSectionContent subtitle="Options">
      {formik.values.groupedOptions ? (
        <GroupedOptions<T>
          type={type}
          formik={formik}
          disabled={disabled}
          isTemplatedNode={isTemplatedNode}
        />
      ) : (
        <>
          <ListManager
            values={nonExclusiveOptions || []}
            onChange={(newOptions) => {
              const newCombinedOptions =
                newOptions.length === 0
                  ? []
                  : [...newOptions, ...exclusiveOptions];

              formik.setFieldValue("options", newCombinedOptions);
            }}
            disabled={disabled}
            itemName="option"
            newValue={() => ({
              id: "",
              data: {
                text: "",
                description: "",
                val: "",
                flags: [],
                ...(type === ComponentType.ResponsiveChecklist && {
                  rule: DEFAULT_RULE,
                }),
              },
            })}
            Editor={ChecklistOptionsEditor}
            editorExtraProps={{
              type,
              showValueField: !!formik.values.fn,
              schema: getOptionsSchemaByFn(
                formik.values.fn,
                schema,
                currentOptionVals,
              ),
            }}
            isTemplatedNode={isTemplatedNode}
            collapsible={true}
          />
          {exclusiveOrOptionManagerShouldRender ? (
            <ExclusiveOrOptionManager
              type={type}
              formik={formik}
              exclusiveOptions={exclusiveOptions}
              nonExclusiveOptions={nonExclusiveOptions}
              disabled={disabled}
              isTemplatedNode={isTemplatedNode}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </ModalSectionContent>
  );
};

import { ComponentType } from "@opensystemslab/planx-core/types";
import type { AnyOption } from "@planx/components/Option/model";
import { useCurrentOptions } from "@planx/components/shared/BaseChecklist/Public/hooks/useInitialOptions";
import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { partition } from "lodash";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import type { AnyChecklist } from "../../../model";
import { ExclusiveOrOptionManager } from "./ExclusiveOrOptionManager";
import { GroupedOptions } from "./GroupedOptions";
import ChecklistOptionsEditor from "./OptionsEditor";

export const Options = <T extends AnyChecklist>({
  formik,
  disabled,
  isTemplatedNode,
}: {
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
            newValueLabel="add new option"
            newValue={() => ({
              id: "",
              data: {
                text: "",
                description: "",
                val: "",
                flags: [],
                // TODO: Rule!
              },
            })}
            Editor={ChecklistOptionsEditor}
            editorExtraProps={{
              type: ComponentType.Checklist,
              showValueField: !!formik.values.fn,
              schema: getOptionsSchemaByFn(
                formik.values.fn,
                schema,
                currentOptionVals,
              ),
            }}
            isTemplatedNode={isTemplatedNode}
          />
          {exclusiveOrOptionManagerShouldRender ? (
            <ExclusiveOrOptionManager
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

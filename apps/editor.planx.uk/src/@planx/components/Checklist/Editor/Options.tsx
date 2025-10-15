import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { partition } from "lodash";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { Option } from "../../shared";
import { useCurrentOptions } from "../Public/hooks/useInitialOptions";
import { ExclusiveOrOptionManager } from "./components/ExclusiveOrOptionManager";
import { GroupedOptions } from "./components/GroupedOptions";
import ChecklistOptionsEditor from "./components/OptionsEditor";

export const Options: React.FC<{
  formik: FormikHookReturn;
  disabled?: boolean;
  isTemplatedNode?: boolean;
}> = ({ formik, disabled, isTemplatedNode }) => {
  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    formik.values.options,
    (option) => option.data.exclusive,
  );

  const exclusiveOrOptionManagerShouldRender = nonExclusiveOptions.length > 0;

  const { schema, currentOptionVals } = useCurrentOptions(formik);

  return (
    <ModalSectionContent subtitle="Options">
      {formik.values.groupedOptions ? (
        <GroupedOptions
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
              },
            })}
            Editor={ChecklistOptionsEditor}
            editorExtraProps={{
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

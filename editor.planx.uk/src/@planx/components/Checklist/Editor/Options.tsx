import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { partition } from "lodash";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { Option } from "../../shared";
import { useInitialOptions } from "../Public/hooks/useInitialOptions";
import { ExclusiveOrOptionManager } from "./components/ExclusiveOrOptionManager";
import { GroupedOptions } from "./components/GroupedOptions";
import ChecklistOptionsEditor from "./components/OptionsEditor";

export const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    formik.values.options,
    (option) => option.data.exclusive,
  );

  const exclusiveOrOptionManagerShouldRender = nonExclusiveOptions.length > 0;

  const { schema, initialOptionVals } = useInitialOptions(formik);

  return (
    <ModalSectionContent subtitle="Options">
      {formik.values.groupedOptions ? (
        <GroupedOptions formik={formik} />
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
            newValueLabel="add new option"
            newValue={() =>
              ({
                data: {
                  text: "",
                  description: "",
                  val: "",
                },
              }) as Option
            }
            Editor={ChecklistOptionsEditor}
            editorExtraProps={{
              showValueField: !!formik.values.fn,
              schema: getOptionsSchemaByFn(
                formik.values.fn,
                schema,
                initialOptionVals,
              ),
            }}
          />
          {exclusiveOrOptionManagerShouldRender ? (
            <ExclusiveOrOptionManager
              formik={formik}
              exclusiveOptions={exclusiveOptions}
              nonExclusiveOptions={nonExclusiveOptions}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </ModalSectionContent>
  );
};

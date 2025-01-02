import { hasFeatureFlag } from "lib/featureFlags";
import { partition } from "lodash";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { Option } from "../../../shared";
import { ExclusiveOrOptionManager } from "./ExclusiveOrOptionManager";
import { GroupedOptions } from "./GroupedOptions";
import ChecklistOptionsEditor from "./OptionsEditor";

export const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    formik.values.options,
    (option) => option.data.exclusive
  );

  const exclusiveOrOptionManagerShouldRender =
    hasFeatureFlag("EXCLUSIVE_OR") && nonExclusiveOptions.length;

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
                  : [...exclusiveOptions, ...newOptions];

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
            editorExtraProps={{ showValueField: !!formik.values.fn }}
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

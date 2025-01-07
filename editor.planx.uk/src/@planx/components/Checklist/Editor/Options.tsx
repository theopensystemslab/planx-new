import Box from "@mui/material/Box";
import { BaseOptionsEditor } from "@planx/components/shared/BaseOptionsEditor";
import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { hasFeatureFlag } from "lib/featureFlags";
import { partition } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { Option } from "../../shared";
import type { Group } from "../model";
import { GroupedOptions } from "./components/GroupedOptions";
import ChecklistOptionsEditor from "./components/OptionsEditor";

export const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
  // Account for flat or expandable Checklist options
  formik.values.options =
    formik.values.options ||
    formik.values.groupedOptions
      ?.map((group: Group<Option>) => group.children)
      ?.flat();

  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    formik.values.options,
    (option) => option.data.exclusive,
  );

  const exclusiveOrOptionManagerShouldRender =
    hasFeatureFlag("EXCLUSIVE_OR") && nonExclusiveOptions.length;

  const schema = useStore().getFlowSchema()?.options;
  const initialOptions: Option[] | undefined =
    formik.initialValues.options ||
    formik.initialValues.groupedOptions
      ?.map((group: Group<Option>) => group.children)
      ?.flat();
  const initialOptionVals = initialOptions?.map((option) => option.data?.val);

  return (
    <ModalSectionContent subtitle="Options">
      {formik.values.groupedOptions ? (
        <GroupedOptions formik={formik} />
      ) : (
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
          editorExtraProps={{
            showValueField: !!formik.values.fn,
            schema: getOptionsSchemaByFn(
              formik.values.fn,
              schema,
              initialOptionVals,
            ),
          }}
        />
      )}
      {exclusiveOrOptionManagerShouldRender ? (
        <Box mt={1}>
          <ErrorWrapper error={formik.errors.allRequired as string}>
            <ListManager
              values={exclusiveOptions || []}
              onChange={(newExclusiveOptions) => {
                const newCombinedOptions = [
                  ...nonExclusiveOptions,
                  ...newExclusiveOptions,
                ];
                formik.setFieldValue("options", newCombinedOptions);
              }}
              newValueLabel='add "or" option'
              maxItems={1}
              disableDragAndDrop
              newValue={() =>
                ({
                  data: {
                    text: "",
                    description: "",
                    val: "",
                    exclusive: true,
                  },
                }) as Option
              }
              Editor={BaseOptionsEditor}
              editorExtraProps={{
                showValueField: !!formik.values.fn,
                schema: getOptionsSchemaByFn(
                  formik.values.fn,
                  schema,
                  initialOptionVals,
                ),
              }}
            />
          </ErrorWrapper>
        </Box>
      ) : (
        <></>
      )}
    </ModalSectionContent>
  );
};

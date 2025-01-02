import Box from "@mui/material/Box";
import { BaseOptionsEditor } from "@planx/components/shared/BaseOptionsEditor";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { Option } from "../../../shared";

interface Props {
  formik: FormikHookReturn;
  exclusiveOptions: Option[];
  nonExclusiveOptions: Option[];
  groupIndex?: number;
  grouped?: true;
}

export const ExclusiveOrOptionManager = ({
  formik,
  exclusiveOptions,
  nonExclusiveOptions,
  groupIndex,
  grouped,
}: Props) => {
  return (
    <Box mt={1}>
      <ErrorWrapper error={formik.errors.allRequired as string}>
        <ListManager
          values={exclusiveOptions || []}
          onChange={(newExclusiveOptions) => {
            const newCombinedOptions = [
              ...nonExclusiveOptions,
              ...newExclusiveOptions,
            ];
            if (grouped) {
              formik.setFieldValue(
                `groupedOptions[${groupIndex}].children`,
                newCombinedOptions
              );
            } else {
              formik.setFieldValue("options", newCombinedOptions);
            }
          }}
          newValueLabel='add "or" option'
          maxItems={1}
          disableDragAndDrop
          newValue={() => {
            return {
              data: {
                text: "",
                description: "",
                val: "",
                exclusive: true,
              },
            } as Option;
          }}
          Editor={BaseOptionsEditor}
          editorExtraProps={{ showValueField: !!formik.values.fn, groupIndex }}
        />
      </ErrorWrapper>
    </Box>
  );
};

import Box from "@mui/material/Box";
import { BaseOptionsEditor } from "@planx/components/shared/BaseOptionsEditor";
import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { Option } from "../../../shared";
import { Group } from "../../model";
import { useInitialOptions } from "../../Public/hooks/useInitialOptions";

interface Props {
  formik: FormikHookReturn;
  exclusiveOptions: Option[];
  nonExclusiveOptions: Option[] | Array<Group<Option>>;
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
  const { schema, initialOptionVals } = useInitialOptions(formik);

  return (
    <Box mt={2}>
      <ErrorWrapper error={formik.errors.allRequired as string}>
        <Box mt={1}>
          <ListManager
            values={exclusiveOptions || []}
            onChange={(newExclusiveOptions) => {
              if (grouped) {
                const updateGroupedOptions = () => {
                  if (newExclusiveOptions.length > 0) {
                    const exclusiveOptionGroup = {
                      title: "Or",
                      exclusive: true,
                      children: newExclusiveOptions,
                    };

                    return [...nonExclusiveOptions, exclusiveOptionGroup];
                  } else {
                    return [...nonExclusiveOptions];
                  }
                };

                formik.setFieldValue("groupedOptions", updateGroupedOptions());
                return;
              }
              const newCombinedOptions = [
                ...nonExclusiveOptions,
                ...newExclusiveOptions,
              ];
              formik.setFieldValue("options", newCombinedOptions);
            }}
            newValueLabel='add "or" option'
            maxItems={1}
            noDragAndDrop
            newValue={() =>
              ({
                id: "",
                data: {
                  text: "",
                  description: "",
                  val: "",
                  flags: [],
                  exclusive: true,
                },
              }) satisfies Option
            }
            Editor={BaseOptionsEditor}
            editorExtraProps={{
              showValueField: !!formik.values.fn,
              groupIndex,
              optionPlaceholder: "Exclusive 'or' option",
              schema: getOptionsSchemaByFn(
                formik.values.fn,
                schema,
                initialOptionVals,
              ),
            }}
          />
        </Box>
      </ErrorWrapper>
    </Box>
  );
};

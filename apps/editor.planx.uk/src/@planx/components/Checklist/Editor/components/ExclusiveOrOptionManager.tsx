import Box from "@mui/material/Box";
import { BaseOptionsEditor } from "@planx/components/shared/BaseOptionsEditor";
import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { getIn } from "formik";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { Option } from "../../../shared";
import { Group } from "../../model";
import { useCurrentOptions } from "../../Public/hooks/useInitialOptions";

interface Props {
  formik: FormikHookReturn;
  exclusiveOptions: Option[];
  nonExclusiveOptions: Option[] | Array<Group<Option>>;
  groupIndex?: number;
  grouped?: true;
  disabled?: boolean;
  isTemplatedNode?: boolean;
}

export const ExclusiveOrOptionManager = ({
  formik,
  exclusiveOptions,
  nonExclusiveOptions,
  groupIndex,
  grouped,
  disabled,
  isTemplatedNode,
}: Props) => {
  const { schema, currentOptionVals } = useCurrentOptions(formik);

  return (
    <Box mt={2}>
      <ErrorWrapper error={getIn(formik.errors, "allRequired")}>
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
            disabled={disabled}
            editorExtraProps={{
              showValueField: !!formik.values.fn,
              groupIndex,
              optionPlaceholder: "Exclusive 'or' option",
              schema: getOptionsSchemaByFn(
                formik.values.fn,
                schema,
                currentOptionVals,
              ),
            }}
            isTemplatedNode={isTemplatedNode}
          />
        </Box>
      </ErrorWrapper>
    </Box>
  );
};

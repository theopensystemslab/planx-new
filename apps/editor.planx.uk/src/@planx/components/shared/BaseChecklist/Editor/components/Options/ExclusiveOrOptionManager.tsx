import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { AnyOption, AnyOptions } from "@planx/components/Option/model";
import { DEFAULT_RULE } from "@planx/components/ResponsiveChecklist/model";
import {
  AnyChecklist,
  OptionGroup,
} from "@planx/components/shared/BaseChecklist/model";
import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { getIn } from "formik";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { useCurrentOptions } from "../../../Public/hooks/useInitialOptions";
import ChecklistOptionsEditor from "./OptionsEditor";

interface Props<T extends AnyChecklist> {
  type: ComponentType.Checklist | ComponentType.ResponsiveChecklist;
  formik: FormikHookReturn<T>;
  exclusiveOptions: AnyOptions;
  nonExclusiveOptions: AnyOptions | OptionGroup[];
  groupIndex?: number;
  grouped?: true;
  disabled?: boolean;
  isTemplatedNode?: boolean;
}

export const ExclusiveOrOptionManager = <T extends AnyChecklist>({
  type,
  formik,
  exclusiveOptions,
  nonExclusiveOptions,
  groupIndex,
  grouped,
  disabled,
  isTemplatedNode,
}: Props<T>) => {
  const { schema, currentOptionVals } = useCurrentOptions(formik);

  return (
    <Box>
      <ErrorWrapper error={getIn(formik.errors, "allRequired")}>
        <Box mt={1}>
          <Typography variant="h4" mt={4} mb={2}>
            Exclusive "or" option
          </Typography>
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
            itemName='"or" option'
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
                  ...(type === ComponentType.ResponsiveChecklist && {
                    rule: DEFAULT_RULE,
                  }),
                },
              }) satisfies AnyOption
            }
            Editor={ChecklistOptionsEditor}
            disabled={disabled}
            editorExtraProps={{
              type,
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

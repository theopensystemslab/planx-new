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
  exclusiveOptionGroup: Array<Group<Option>>;
  nonExclusiveOptionGroups: Array<Group<Option>>;
}

export const ExclusiveOrOptionManager2 = ({
  formik,
  exclusiveOptionGroup,
  nonExclusiveOptionGroups,
}: Props) => {
  const { schema, initialOptionVals } = useInitialOptions(formik);

  return (
    <Box mt={1}>
      <ErrorWrapper error={formik.errors.allRequired as string}>
        <ListManager
          values={
            (exclusiveOptionGroup.length && exclusiveOptionGroup[0].children) ||
            []
          }
          onChange={(newExclusiveOptions) => {
            // empty array or optionArray with new option added

            // raise error if already an excl option

            const exclusiveOptionGroup = [
              {
                title: "Exclusive Or Option",
                children: newExclusiveOptions,
              },
            ];
            console.log("exclusiveOptionGroup", exclusiveOptionGroup);
            const newGroupedOptions = [
              ...formik.values.groupedOptions,
              ...exclusiveOptionGroup,
            ];
            console.log("newGroupedOptions", newGroupedOptions);

            formik.setFieldValue("groupedOptions", newGroupedOptions);
            return;
            // const newCombinedOptions = [
            //   ...nonExclusiveOptions,
            //   ...newExclusiveOptions,
            // ];
            // formik.setFieldValue("options", newCombinedOptions);
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
  );
};

import Grid from "@mui/material/Grid";
import { Group } from "@planx/components/Checklist/model";
import { FormikProps } from "formik";
import { Store } from "pages/FlowEditor/lib/store";
import React from "react";
import { ExpandableList } from "ui/public/ExpandableList";
import FormWrapper from "ui/public/FormWrapper";

import { Option } from "../../../../shared";
import { useExpandedGroups } from "../../hooks/useExpandedGroups";
import { ChecklistOptionGroup } from "./ChecklistOptionGroup";

interface GroupedChecklistOptionsProps {
  groupedOptions: Group<Option>[];
  previouslySubmittedData: Store.UserData | undefined;
  setCheckedFieldValue: (optionIds: string[]) => void;
  formik: FormikProps<{ checked: Array<string> }>;
}

export const GroupedChecklistOptions = ({
  groupedOptions,
  previouslySubmittedData,
  setCheckedFieldValue,
  formik,
}: GroupedChecklistOptionsProps) => {
  const { expandedGroups, toggleGroup } = useExpandedGroups(
    groupedOptions,
    previouslySubmittedData
  );

  return (
    <FormWrapper>
      <Grid item xs={12}>
        <ExpandableList>
          {groupedOptions.map((group: Group<Option>, index: number) => {
            const isExpanded = expandedGroups.includes(index);

            return (
              <ChecklistOptionGroup
                key={index}
                group={group}
                isExpanded={isExpanded}
                index={index}
                formik={formik}
                setCheckedFieldValue={setCheckedFieldValue}
                toggleGroup={toggleGroup}
              />
            );
          })}
        </ExpandableList>
      </Grid>
    </FormWrapper>
  );
};

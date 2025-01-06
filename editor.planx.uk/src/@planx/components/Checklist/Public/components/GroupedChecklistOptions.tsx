import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Group } from "@planx/components/Checklist/model";
import { FormikProps } from "formik";
import { Store } from "pages/FlowEditor/lib/store";
import React from "react";
import { ExpandableList, ExpandableListItem } from "ui/public/ExpandableList";
import FormWrapper from "ui/public/FormWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

import { Option } from "../../../shared";
import { useExpandedGroups } from "../hooks/useExpandedGroups";

interface GroupedChecklistOptionsProps {
  groupedOptions: Group<Option>[];
  previouslySubmittedData: Store.UserData | undefined;
  changeCheckbox: (id: string) => () => void;
  formik: FormikProps<{ checked: Array<string> }>;
}

export const GroupedChecklistOptions = ({
  groupedOptions,
  previouslySubmittedData,
  changeCheckbox,
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
              <ExpandableListItem
                key={index}
                expanded={isExpanded}
                onToggle={() => toggleGroup(index)}
                headingId={`group-${index}-heading`}
                groupId={`group-${index}-content`}
                title={group.title}
              >
                <Box
                  pt={0.5}
                  pb={2}
                  aria-labelledby={`group-${index}-heading`}
                  id={`group-${index}-content`}
                  data-testid={`group-${index}${isExpanded ? "-expanded" : ""}`}
                >
                  {group.children.map((option) => (
                    <ChecklistItem
                      onChange={changeCheckbox(option.id)}
                      key={option.data.text}
                      label={option.data.text}
                      id={option.id}
                      checked={formik.values.checked.includes(option.id)}
                    />
                  ))}
                </Box>
              </ExpandableListItem>
            );
          })}
        </ExpandableList>
      </Grid>
    </FormWrapper>
  );
};

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Option } from "@planx/components/Option/model";
import { Group } from "@planx/components/shared/BaseChecklist/model";
import { FormikProps } from "formik";
import { Store } from "pages/FlowEditor/lib/store";
import React from "react";
import { ExpandableList, ExpandableListItem } from "ui/public/ExpandableList";
import FormWrapper from "ui/public/FormWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

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
    previouslySubmittedData,
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
                  aria-labelledby={`whole-group-heading group-${index}-heading`}
                  id={`group-${index}-content`}
                  data-testid={`group-${index}${isExpanded ? "-expanded" : ""}`}
                  role="group"
                >
                  {group.children.map((option) => (
                    <ChecklistItem
                      onChange={changeCheckbox(option.id)}
                      key={option.data.text}
                      label={option.data.text}
                      description={option.data.description}
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

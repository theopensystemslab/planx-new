import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Option } from "@planx/components/Option/model";
import { Group } from "@planx/components/shared/BaseChecklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
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
  hasImages?: boolean;
}

export const GroupedChecklistOptions = ({
  groupedOptions,
  previouslySubmittedData,
  changeCheckbox,
  formik,
  hasImages = false,
}: GroupedChecklistOptionsProps) => {
  const { expandedGroups, toggleGroup } = useExpandedGroups(
    groupedOptions,
    previouslySubmittedData,
  );

  return (
    <FormWrapper variant={hasImages ? "fullWidth" : "default"}>
      <Grid item xs={12} sx={{ width: "100%" }}>
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
                {hasImages ? (
                  <Grid
                    container
                    spacing={2}
                    pt={0.5}
                    pb={3}
                    aria-labelledby={`whole-group-heading group-${index}-heading`}
                    id={`group-${index}-content`}
                    data-testid={`group-${index}${isExpanded ? "-expanded" : ""}`}
                    role="group"
                  >
                    {group.children.map((option) => (
                      <Grid item xs={12} sm={6} md={4} key={option.id}>
                        <ImageButton
                          title={option.data.text}
                          id={option.id}
                          img={option.data.img}
                          selected={formik.values.checked.includes(option.id)}
                          onClick={changeCheckbox(option.id)}
                          checkbox
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
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
                )}
              </ExpandableListItem>
            );
          })}
        </ExpandableList>
      </Grid>
    </FormWrapper>
  );
};

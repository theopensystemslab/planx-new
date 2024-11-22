import Autocomplete from "@mui/material/Autocomplete";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React, { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { SelectMultiple, StyledTextField } from "ui/shared/SelectMultiple";

import { ICONS } from "../shared/icons";

interface Flow {
  id: string;
  slug: string;
  name: string;
  team: string;
}

const AutocompleteSubHeader = styled(ListSubheader)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  fontSize: theme.typography.subtitle1.fontSize,
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.getContrastText(theme.palette.background.dark),
  margin: 0,
}));

const ExternalPortalForm: React.FC<{
  id?: string;
  flowId?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
  tags?: NodeTag[];
}> = ({ id, handleSubmit, flowId = "", flows = [], tags = [] }) => {
  const [teamArray, setTeamArray] = useState<string[] | undefined>();

  const uniqueTeamArray = [...new Set(flows.map((item) => item.team))];

  const formik = useFormik({
    initialValues: {
      flowId,
      tags,
    },
    onSubmit: (values) => {
      if (handleSubmit) {
        handleSubmit({ type: TYPES.ExternalPortal, data: values });
      } else {
        alert(JSON.stringify(values, null, 2));
      }
    },
  });

  return (
    <form id="modal" onSubmit={formik.handleSubmit} data-testid="form">
      <ModalSection>
        <ModalSectionContent
          title="External portal"
          Icon={ICONS[TYPES.ExternalPortal]}
        >
          <span>
            External portals let you reference all content from another flow
            inline within this service. Deleting this node does NOT delete the
            flow that it references.
          </span>
        </ModalSectionContent>
        <ModalSectionContent title="Select a team">
          <SelectMultiple
            onChange={(_options, event) => setTeamArray([...event])}
            options={uniqueTeamArray}
            placeholder=""
          />
        </ModalSectionContent>
        <ModalSectionContent title="Pick a flow">
          <Autocomplete
            role="status"
            aria-atomic={true}
            aria-live="polite"
            value={
              flows.find((flow) => flow.id === formik.values.flowId) || null
            }
            onChange={(_event, newValue: Flow | null) => {
              formik.setFieldValue("flowId", newValue?.id || "");
            }}
            options={flows.filter((flow) => {
              if (teamArray) return teamArray?.includes(flow.team);
              return true;
            })}
            groupBy={(option) => option.team}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <MenuItem
                {...props}
                sx={(theme) => ({ paddingY: theme.spacing(1.25) })}
              >
                {option.name}
              </MenuItem>
            )}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  notched: false,
                }}
              />
            )}
            renderGroup={(params) => (
              <>
                <AutocompleteSubHeader>{params.group}</AutocompleteSubHeader>
                {params.children}
              </>
            )}
            slot="popper"
            slotProps={{
              popper: {
                placement: "bottom-start",
                modifiers: [{ name: "flip", enabled: false }],
              },
            }}
          />
        </ModalSectionContent>
        <ComponentTagSelect
          value={formik.values.tags}
          onChange={(value) => formik.setFieldValue("tags", value)}
        />
      </ModalSection>
    </form>
  );
};

export default ExternalPortalForm;

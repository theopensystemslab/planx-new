import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete, {
  autocompleteClasses,
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React, { useState } from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import {
  CustomCheckbox,
  SelectMultiple,
  StyledTextField,
} from "ui/shared/SelectMultiple";

import { ICONS } from "../shared/icons";

interface Flow {
  id: string | "select a flow";
  slug: string;
  name: string;
  team: string;
}

type FlowAutocompleteListProps = AutocompleteProps<
  Flow,
  false,
  true,
  false,
  "li"
>;
type FlowAutocompleteInputProps = AutocompleteProps<
  Flow,
  false,
  true,
  false,
  "input"
>;

const PopupIcon = (
  <ArrowIcon
    sx={(theme) => ({ color: theme.palette.primary.main })}
    fontSize="large"
  />
);

const AutocompleteSubHeader = styled(ListSubheader)(({ theme }) => ({
  border: "none",
  borderTop: `1px solid ${theme.palette.border.main}`,
  backgroundColor: theme.palette.background.default,
}));

const renderOption: FlowAutocompleteListProps["renderOption"] = (
  props,
  option,
) => {
  return (
    <MenuItem
      {...props}
      id={option.id}
      data-testid={`flow-${option.id}`}
      sx={(theme) => ({ paddingY: `${theme.spacing(1.25)}` })}
    >
      {option.name}
    </MenuItem>
  );
};

const renderInput: FlowAutocompleteInputProps["renderInput"] = (params) => (
  <StyledTextField
    {...params}
    id={params.id}
    InputProps={{
      ...params.InputProps,
      notched: false,
    }}
    key={params.id}
  />
);

const renderGroup: FlowAutocompleteListProps["renderGroup"] = (params) => {
  return (
    <React.Fragment key={params.group}>
      <AutocompleteSubHeader
        disableSticky
        id={`group-header-${params.group}`}
        aria-label={params.group}
      >
        <Typography variant="subtitle2" component="h4" py={1.5}>
          {params.group}
        </Typography>
      </AutocompleteSubHeader>
      {params.children}
    </React.Fragment>
  );
};

const ExternalPortalForm: React.FC<{
  flowId?: string;
  notes?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
  tags?: NodeTag[];
}> = ({ handleSubmit, flowId, flows = [], tags = [], notes = "" }) => {
  const [teamArray, setTeamArray] = useState<string[]>([]);

  const uniqueTeamArray = [...new Set(flows.map((item) => item.team))];
  const filterFlows = (event: string[]) => {
    setTeamArray([...event]);
    const filteredFlows = flows?.filter((flow: Flow) =>
      event.includes(flow.team),
    );
    if (filteredFlows.length > 0) {
      formik.setFieldValue("flowId", filteredFlows[0].id);
    } else {
      formik.setFieldValue("flowId", flows[0].id);
    }
  };

  const formik = useFormik({
    initialValues: {
      flowId: flowId || flows[0].id,
      tags,
      notes,
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
        <ModalSectionContent
          key={"team-section"}
          title="Select a team (optional)"
        >
          <SelectMultiple
            id="team-select"
            onChange={(_options, event) => {
              filterFlows(event);
            }}
            value={teamArray}
            options={uniqueTeamArray}
            renderOption={(props, option, { selected }) => {
              return (
                <ListItem {...props} key={`${option}-listitem`}>
                  <CustomCheckbox
                    key={`${option}-checkbox`}
                    aria-hidden="true"
                    className={selected ? "selected" : ""}
                  />
                  {option}
                </ListItem>
              );
            }}
            placeholder=""
          />
        </ModalSectionContent>
        <ModalSectionContent key={"flow-section"} title="Pick a flow">
          <Autocomplete
            data-testid="flowId"
            id="flowId"
            role="status"
            aria-atomic={true}
            aria-live="polite"
            fullWidth
            popupIcon={PopupIcon}
            ListboxProps={{
              sx: (theme) => ({
                paddingY: 0,
                backgroundColor: theme.palette.background.default,
              }),
            }}
            value={
              flows.find((flow: Flow) => flow.id === formik.values.flowId) ||
              flows[0]
            }
            onChange={(_event, newValue: Flow) => {
              formik.setFieldValue("flowId", newValue.id);
            }}
            options={
              flows &&
              flows.filter((flow) => {
                if (teamArray.length > 0) return teamArray.includes(flow.team);
                return true;
              })
            }
            groupBy={(option) => option.team}
            getOptionLabel={(option) => option.name}
            renderOption={renderOption}
            renderInput={renderInput}
            renderGroup={renderGroup}
            slotProps={{
              popper: {
                placement: "bottom-start",
                modifiers: [{ name: "flip", enabled: false }],
              },
            }}
            sx={{
              [`& .${autocompleteClasses.endAdornment}`]: {
                top: "unset",
              },
            }}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
};

export default ExternalPortalForm;

import { autocompleteClasses } from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import AutocompleteInput from "ui/shared/Autocomplete/AutocompleteInput";
import { RenderGroupHeaderBlock } from "ui/shared/Autocomplete/components/RenderGroupHeaderBlock";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { PopupIcon } from "ui/shared/PopUpIcon";
import * as Yup from "yup";

import { ICONS } from "../shared/icons";
import { Flow, FlowAutocompleteListProps } from "./types";

const renderOption: FlowAutocompleteListProps["renderOption"] = (
  props,
  option,
) => {
  if (option === null) return;
  return (
    <ListItem
      {...props}
      key={option.id}
      id={option.id}
      data-testid={`flow-${option.id}`}
      sx={(theme) => ({ paddingY: `${theme.spacing(1.25)}` })}
    >
      {option.name}
    </ListItem>
  );
};

const renderGroup: FlowAutocompleteListProps["renderGroup"] = (params) => {
  return (
    <RenderGroupHeaderBlock
      key={params.key}
      params={params}
      displayName={params.group}
    />
  );
};

const ExternalPortalForm: React.FC<{
  flowId?: string;
  notes?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
  tags?: NodeTag[];
  disabled?: boolean;
}> = ({
  handleSubmit,
  flowId,
  flows = [],
  tags = [],
  notes = "",
  disabled = false,
}) => {
  const portalSchema = Yup.object().shape({
    flowId: Yup.string().required("Add a flow to submit"),
  });

  const formik = useFormik({
    initialValues: {
      flow: flows.find((flow) => flow.id === flowId) || null,
      flowId: flowId || null,
      tags,
      notes,
    },
    onSubmit: (values) => {
      formik.validateForm(values);
      if (handleSubmit && !formik.errors.flowId) {
        handleSubmit({ type: TYPES.ExternalPortal, data: values });
      } else {
        alert(JSON.stringify(values, null, 2));
      }
    },
    validationSchema: portalSchema,
    validateOnChange: false,
    validateOnBlur: false,
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
        <ModalSectionContent key={"flow-section"} title="Pick a flow">
          <ErrorWrapper error={formik.errors.flowId}>
            <AutocompleteInput<Flow>
              data-testid="flowId"
              id="flowId"
              role="status"
              placeholder=""
              required
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
              value={formik.values.flow}
              onChange={(_event, value: string | Flow | null) => {
                if (typeof value !== "string") {
                  formik.setFieldValue("flow", value);
                  value?.id && formik.setFieldValue("flowId", value.id);
                }
              }}
              options={flows}
              groupBy={(option) => option && option.team}
              getOptionLabel={(option: string | Flow | null) => {
                if (typeof option !== "string" && option) {
                  return `${option.team} - ${option?.name}`;
                } else {
                  return "";
                }
              }}
              renderOption={renderOption}
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
              clearOnEscape
              handleHomeEndKeys
              autoHighlight
              forcePopupIcon={true}
              disabled={disabled}
            />
          </ErrorWrapper>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={disabled}
      />
    </form>
  );
};

export default ExternalPortalForm;

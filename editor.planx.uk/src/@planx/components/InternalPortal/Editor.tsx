import MenuItem from "@mui/material/MenuItem";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import { ICONS } from "../shared/icons";

interface Flow {
  id: string;
  text: string;
}

const InternalPortalForm: React.FC<{
  id?: string;
  text?: string;
  flowId?: string;
  notes?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
  tags?: NodeTag[];
  disabled?: boolean;
  isTemplatedNode?: boolean;
  templatedNodeInstructions?: string;
  areTemplatedNodeInstructionsRequired?: boolean;
}> = ({
  handleSubmit,
  text = "",
  flowId = "",
  flows = [],
  tags = [],
  notes = "",
  disabled,
  isTemplatedNode = false,
  templatedNodeInstructions = "",
  areTemplatedNodeInstructionsRequired = false,
}) => {
  const formik = useFormik({
    initialValues: {
      text,
      flowId,
      tags,
      notes,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.flowId && !values.text) {
        errors.text =
          flows.length > 0
            ? "Enter a portal name or select an existing portal"
            : "Enter a portal name";
      }
      return errors;
    },
    onSubmit: (values) => {
      const payload = values.flowId
        ? values.flowId
        : { type: TYPES.InternalPortal, data: values };
      if (handleSubmit) {
        handleSubmit(payload);
      } else {
        alert(JSON.stringify(payload, null, 2));
      }
    },
  });

  return (
    <form id="modal" onSubmit={formik.handleSubmit} data-testid="form">
      <TemplatedNodeInstructions
        isTemplatedNode={isTemplatedNode}
        templatedNodeInstructions={templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent
          title="Internal portal"
          Icon={ICONS[TYPES.InternalPortal]}
        >
          <ErrorWrapper error={formik.errors.text}>
            <Input
              name="text"
              onChange={formik.handleChange}
              placeholder="Enter a portal name"
              rows={2}
              value={formik.values.text}
              disabled={disabled || !!formik.values.flowId}
              id="portalFlowId"
            />
          </ErrorWrapper>
        </ModalSectionContent>
        {flows?.length > 0 && (
          <ModalSectionContent subtitle="Use an existing portal">
            <InputLabel
              label="Use an existing portal"
              id="flowId-label"
              hidden
              htmlFor="flowId"
            />
            <SelectInput
              aria-describedby="flowId"
              labelId="flowId-label"
              id="flowId"
              data-testid="flowId"
              name="flowId"
              value={formik.values.flowId}
              onChange={formik.handleChange}
              disabled={disabled || !!formik.values.text}
            >
              {flows.map((flow) => (
                <MenuItem key={flow.id} value={flow.id}>
                  {flow.text}
                </MenuItem>
              ))}
            </SelectInput>
          </ModalSectionContent>
        )}
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={disabled}
      />
    </form>
  );
};

export default InternalPortalForm;

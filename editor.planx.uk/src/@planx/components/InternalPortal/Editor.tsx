import MenuItem from "@mui/material/MenuItem";
import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";

interface Flow {
  id: string;
  text: string;
}

const InternalPortalForm: React.FC<{
  id?: string;
  text?: string;
  flowId?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
  tags?: NodeTag[];
}> = ({ id, handleSubmit, text = "", flowId = "", flows = [], tags = [] }) => {
  const formik = useFormik({
    initialValues: {
      text,
      flowId,
      tags,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.flowId && !values.text) {
        errors.text = flows.length > 0 ? "Enter a portal name" : "Required.";
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
      <ModalSection>
        <ModalSectionContent
          title="Internal Portal"
          Icon={ICONS[TYPES.InternalPortal]}
        >
          <ErrorWrapper error={formik.errors.text}>
            <Input
              name="text"
              onChange={formik.handleChange}
              placeholder="Enter a portal name"
              rows={2}
              value={formik.values.text}
              disabled={!!formik.values.flowId}
              id="portalFlowId"
            />
          </ErrorWrapper>
        </ModalSectionContent>
        {flows?.length > 0 && (
          <ModalSectionContent subtitle="Use existing portal">
            <SelectInput
              id="flowId"
              data-testid="flowId"
              name="flowId"
              value={formik.values.flowId}
              onChange={formik.handleChange}
              disabled={!!formik.values.text}
              placeholder="Select an existing portal"
            >
              {flows.map((flow) => (
                <MenuItem key={flow.id} value={flow.id}>
                  {flow.text}
                </MenuItem>
              ))}
            </SelectInput>
          </ModalSectionContent>
        )}
        <ComponentTagSelect
          value={formik.values.tags}
          onChange={(value) => formik.setFieldValue("tags", value)}
        />
      </ModalSection>
    </form>
  );
};

export default InternalPortalForm;

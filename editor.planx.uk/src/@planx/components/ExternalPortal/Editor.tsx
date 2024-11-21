import {
  ComponentType as TYPES,
  NodeTag,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { ICONS } from "../shared/icons";

interface Flow {
  id: string;
  text: string;
}

const ExternalPortalForm: React.FC<{
  id?: string;
  flowId?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
  tags?: NodeTag[];
}> = ({ id, handleSubmit, flowId = "", flows = [], tags = [] }) => {
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
        <ModalSectionContent title="Pick a flow">
          <select
            data-testid="flowId"
            name="flowId"
            value={formik.values.flowId}
            onChange={formik.handleChange}
          >
            {!id && <option value="" />}
            {flows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.text}
              </option>
            ))}
          </select>
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

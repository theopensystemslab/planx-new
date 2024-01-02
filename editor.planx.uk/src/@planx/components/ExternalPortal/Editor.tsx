import { TYPES } from "@planx/components/types";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { ICONS } from "../ui";

interface Flow {
  id: string;
  text: string;
}

const ExternalPortalForm: React.FC<{
  id?: string;
  flowId?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
}> = ({ id, handleSubmit, flowId = "", flows = [] }) => {
  const formik = useFormik({
    initialValues: {
      flowId,
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
      </ModalSection>
    </form>
  );
};

export default ExternalPortalForm;

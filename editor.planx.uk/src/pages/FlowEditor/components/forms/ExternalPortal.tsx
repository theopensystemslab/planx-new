import { TYPES } from "@planx/components/types";
import { useFormik } from "formik";
import React from "react";

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
    </form>
  );
};

export default ExternalPortalForm;

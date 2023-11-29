import { useFormik } from "formik";
import React from "react";
import InputField from "ui/InputField";

import { TYPES } from "../types";
import { FormError } from "../ui";

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
}> = ({ id, handleSubmit, text = "", flowId = "", flows = [] }) => {
  const formik = useFormik({
    initialValues: {
      text,
      flowId,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.flowId && !values.text) {
        errors.text =
          flows.length > 0 ? "Required if no flow is selected" : "Required.";
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
      <div>
        <label htmlFor="portalFlowId">Create new internal portal: </label>
        <InputField
          name="text"
          onChange={formik.handleChange}
          placeholder="Portal name"
          rows={2}
          value={formik.values.text}
          disabled={!!formik.values.flowId}
          id="portalFlowId"
          // required={!formik.values.flowId} (was ignored by @testing-library?)
        />
        {formik.errors.text && <FormError message={formik.errors.text} />}
      </div>
      {flows?.length > 0 && (
        <>
          <span>
            <br /> OR
            <br />
            <br />
            <label htmlFor="flowId">Point to an existing portal:</label>
            <br />
          </span>
          <select
            id="flowId"
            data-testid="flowId"
            name="flowId"
            value={formik.values.flowId}
            onChange={formik.handleChange}
            disabled={!!formik.values.text}
          >
            {!id && <option value="" />}
            {flows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.text}
              </option>
            ))}
          </select>
        </>
      )}
    </form>
  );
};

export default InternalPortalForm;

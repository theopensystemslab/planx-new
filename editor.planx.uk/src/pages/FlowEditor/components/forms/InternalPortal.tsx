import { useFormik } from "formik";
import React from "react";
import InputField from "ui/InputField";
import { TYPES } from "../../data/types";

interface Flow {
  id: string;
  text: string;
}

const InternalPortalForm: React.FC<{
  id?: string;
  text?: string;
  flowId?: string;
  handleSubmit?;
  flows?: Array<Flow>;
}> = ({ id, handleSubmit, text = "", flowId = "", flows = [] }) => {
  const formik = useFormik({
    initialValues: {
      text,
      flowId,
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
        <InputField
          autoFocus
          name="text"
          onChange={formik.handleChange}
          placeholder="Portal name"
          rows={2}
          value={formik.values.text}
          disabled={!!formik.values.flowId}
        />
      </div>
      {flows?.length > 0 && (
        <>
          <span> OR </span>
          <select
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

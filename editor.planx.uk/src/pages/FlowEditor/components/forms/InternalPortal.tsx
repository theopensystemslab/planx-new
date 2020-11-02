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
      console.log(values);
      if (handleSubmit) {
        if (id) {
          alert("portal updates currently disabled (sorry!)");
        } else {
          handleSubmit({ type: TYPES.InternalPortal, data: values });
        }
      } else {
        alert(JSON.stringify(values, null, 2));
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
          // disabled={!!formik.values.flowId}
          // required={!formik.values.flowId}
        />
      </div>

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

export default InternalPortalForm;

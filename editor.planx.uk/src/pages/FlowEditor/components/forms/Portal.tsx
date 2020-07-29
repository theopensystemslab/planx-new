import { useFormik } from "formik";
import React from "react";
import { TYPES } from "../../lib/flow";
import InputField from "./components/InputField";

const PortalForm: React.FC<{
  text?: string;
  flowId?: string;
  handleSubmit?;
  internalFlows;
  externalFlows;
}> = ({
  handleSubmit,
  text = "",
  flowId = "",
  internalFlows = [],
  externalFlows = [],
}) => {
  const formik = useFormik({
    initialValues: {
      text,
      flowId,
    },
    onSubmit: (values) => {
      if (handleSubmit) {
        handleSubmit({ $t: TYPES.Portal, ...values });
      } else {
        alert(JSON.stringify(values, null, 2));
      }
    },
  });

  return (
    <form id="modal" onSubmit={formik.handleSubmit}>
      <div>
        <InputField
          autoFocus
          name="text"
          onChange={formik.handleChange}
          placeholder="Portal name"
          rows={2}
          value={formik.values.text}
          disabled={!!formik.values.flowId}
          required={!formik.values.flowId}
        />
      </div>

      <div>
        or
        <div>
          <select
            name="flowId"
            value={formik.values.flowId}
            onChange={formik.handleChange}
          >
            <option value="" />
            {internalFlows.map((flow) => (
              <option key={flow.id} value={flow.id}>
                {flow.text}
              </option>
            ))}

            <optgroup label="External Flows">
              {externalFlows.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.team.slug}/{flow.slug}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </form>
  );
};

export default PortalForm;

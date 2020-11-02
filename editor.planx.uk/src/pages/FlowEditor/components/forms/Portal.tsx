import { useFormik } from "formik";
import React from "react";
import { InputField } from "../../../../ui";
import { TYPES } from "../../data/types";

interface Flow {
  id: string;
  text: string;
}

const PortalForm: React.FC<{
  id?: string;
  text?: string;
  flowId?: string;
  handleSubmit?;
  internalFlows?: Array<Flow>;
  externalFlows?: Array<Flow>;
}> = ({
  id,
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
        if (id) {
          alert("portal updates currently disabled (sorry!)");
        } else {
          handleSubmit({ type: TYPES.Portal, data: values });
        }
      } else {
        alert(JSON.stringify(values, null, 2));
      }
    },
  });

  const isNewPortal = !id;
  const isExternalPortal = flowId;

  const isNewOrIsExistingInternal =
    isNewPortal || (!isNewPortal && !isExternalPortal);

  return (
    <form id="modal" onSubmit={formik.handleSubmit} data-testid="form">
      {isNewOrIsExistingInternal && (
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
      )}

      {(!isNewPortal && !isExternalPortal) ||
        (internalFlows.length + externalFlows.length > 0 && (
          <div>
            {isNewOrIsExistingInternal && "or"}
            <div>
              <select
                data-testid="flowId"
                name="flowId"
                value={formik.values.flowId}
                onChange={formik.handleChange}
              >
                {isNewOrIsExistingInternal && <option value="" />}

                {internalFlows.length > 0 &&
                  internalFlows.map((flow) => (
                    <option key={flow.id} value={flow.id}>
                      {flow.text}
                    </option>
                  ))}

                {externalFlows.length > 0 && (
                  <optgroup label="External Flows">
                    {externalFlows.map((flow) => (
                      <option key={flow.id} value={flow.id}>
                        {flow.text}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        ))}
    </form>
  );
};

export default PortalForm;

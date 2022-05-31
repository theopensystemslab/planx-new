import { TYPES } from "@planx/components/types";
import { flowHasReview } from "api/flowHasReview";
import WarningMessages from "components/ErrorsWarning";
import { FormikErrors, useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
interface Flow {
  id: string;
  text: string;
}

type Errors = FormikErrors<{ flowId?: string }>;

const ExternalPortalForm: React.FC<{
  id?: string;
  flowId?: string;
  handleSubmit?: (val: any) => void;
  flows?: Array<Flow>;
  setIsValid?: (value: boolean) => void;
}> = ({ id, handleSubmit, flowId = "", flows = [], setIsValid }) => {
  const [currentFlowId] = useStore((state) => [state.id]);

  const formik = useFormik({
    validate,
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
      {Boolean(Object.keys(formik.errors).length) && (
        <WarningMessages errors={Object.values(formik.errors)} />
      )}
      <select
        data-testid="flowId"
        name="flowId"
        value={formik.values.flowId}
        onChange={formik.handleChange}
      >
        {!id && <option value="" />}
        {flows.map((flow) => (
          <option key={flow.id} value={flow.id} data-testid={flow.id}>
            {flow.text}
          </option>
        ))}
      </select>
    </form>
  );

  async function validate({ flowId }: { flowId?: string }): Promise<Errors> {
    const errors: Errors = {};

    if (!flowId) {
      errors.flowId = "Please select a flow";
    } else {
      const responses = await Promise.all([
        flowHasReview(currentFlowId, id),
        flowHasReview(flowId, id),
      ]);

      if (responses.every((res) => res.hasReview)) {
        errors.flowId =
          "Both selected and current flows contain a Review component but you can only add one review component per flow, including the ones inside portals. Remove the existing review component before adding this Portal.";
      }
    }

    if (setIsValid) setIsValid(!errors.flowId);

    return errors;
  }
};

export default ExternalPortalForm;

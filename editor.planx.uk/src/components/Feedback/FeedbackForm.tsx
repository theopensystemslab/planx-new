import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { Form, Formik, useFormikContext } from "formik";
import React from "react";
import FeedbackDisclaimer from "ui/public/FeedbackDisclaimer";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";

import { FeedbackFormInput, FormProps, UserFeedback } from ".";

const StyledForm = styled(Form)(({ theme }) => ({
  "& > *": contentFlowSpacing(theme),
}));

function FormInputs({ inputs }: { inputs: FeedbackFormInput[] }): FCReturn {
  const { values, errors, handleChange } = useFormikContext<UserFeedback>();

  return (
    <>
      {inputs.map((input: FeedbackFormInput) => (
        <ErrorWrapper
          key={input.name}
          error={errors?.[input.name]}
          id={`${input.label || input.ariaDescribedBy}-error`}
        >
          {input.label ? (
            <InputLabel label={input.label} htmlFor={input.id}>
              <Input
                required
                multiline
                bordered
                id={input.id}
                name={input.name}
                value={values?.[input.name]}
                onChange={handleChange}
              />
            </InputLabel>
          ) : (
            <Input
              name={input.name}
              required
              multiline
              bordered
              aria-describedby={input.ariaDescribedBy}
              value={values?.[input.name]}
              onChange={handleChange}
            />
          )}
        </ErrorWrapper>
      ))}
    </>
  );
}

const FeedbackForm: React.FC<FormProps> = ({ inputs, handleSubmit }) => {
  const initialValues: UserFeedback = {
    userContext: undefined,
    userComment: "",
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <StyledForm>
        <FormInputs inputs={inputs} />
        <FeedbackDisclaimer />
        <Button type="submit" variant="contained" sx={{ marginTop: 2.5 }}>
          Send feedback
        </Button>
      </StyledForm>
    </Formik>
  );
};

export default FeedbackForm;

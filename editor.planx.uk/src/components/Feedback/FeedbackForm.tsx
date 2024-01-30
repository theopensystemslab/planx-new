import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { useFormik } from "formik";
import React from "react";
import FeedbackDisclaimer from "ui/public/FeedbackDisclaimer";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input";

import { FeedbackFormInput, FormProps, UserFeedback } from ".";

const Form = styled("form")(({ theme }) => ({
  "& > *": {
    // Assuming contentFlowSpacing is a function that returns styles
    ...contentFlowSpacing(theme),
  },
}));

function FormInputs({
  formik,
  inputs,
}: {
  formik: any;
  inputs: FeedbackFormInput[];
}): FCReturn {
  return (
    <>
      {inputs.map((input: FeedbackFormInput) => (
        <ErrorWrapper
          key={input.name}
          error={formik.errors?.[input.name]}
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
                onChange={formik.handleChange}
                value={formik.values?.[input.name]}
              />
            </InputLabel>
          ) : (
            <Input
              name={input.name}
              required
              multiline
              bordered
              aria-describedby={input.ariaDescribedBy}
              onChange={formik.handleChange}
              value={formik.values?.[input.name]}
            />
          )}
        </ErrorWrapper>
      ))}
    </>
  );
}

const getInitialValues = (inputs: FeedbackFormInput[]) => {
  const initialValues: UserFeedback = {} as UserFeedback;
  inputs.forEach((input) => {
    initialValues[input.name as keyof UserFeedback] = "";
  });
  return initialValues;
};

const FeedbackForm: React.FC<FormProps> = ({ inputs, handleSubmit }) => {
  const formik = useFormik({
    initialValues: getInitialValues(inputs),
    onSubmit: handleSubmit,
  });

  return (
    <Form onSubmit={formik.handleSubmit}>
      <FormInputs formik={formik} inputs={inputs} />
      <FeedbackDisclaimer />
      <Button type="submit" variant="contained" sx={{ marginTop: 2.5 }}>
        Send feedback
      </Button>
    </Form>
  );
};

export default FeedbackForm;

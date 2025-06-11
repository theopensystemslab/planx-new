import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { Form, Formik, useFormikContext } from "formik";
import React from "react";
import { Link as ReactNaviLink } from "react-navi";
import FeedbackDisclaimer from "ui/public/FeedbackDisclaimer";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import { FeedbackFormInput, FormProps, UserFeedback } from "../types";

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
          id={`${input.label}-error`}
        >
          <InputLabel label={input.label} htmlFor={input.id}>
            <Input
              required
              multiline
              bordered
              id={input.id}
              name={input.name}
              value={values?.[input.name]}
              onChange={handleChange}
              data-testid={`${input.name}Textarea`}
            />
          </InputLabel>
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
        <FeedbackDisclaimer>
          Please do not include any personal data such as your name, email or
          address. If we retain any sensitive information, we will act according
          to our{" "}
          <Link
            component={ReactNaviLink}
            href="pages/privacy"
            prefetch={false}
            color="primary"
          >
            privacy notice
          </Link>
          .
        </FeedbackDisclaimer>
        <FormInputs inputs={inputs} />
        <FeedbackDisclaimer>
          The information collected here isn't monitored by planning officers.
          Don't use it to give extra information about your project or
          submission. If you do, it cannot be used to assess your project.
        </FeedbackDisclaimer>
        <Button
          type="submit"
          variant="contained"
          color="prompt"
          sx={{ marginTop: 2.5 }}
        >
          Send feedback
        </Button>
      </StyledForm>
    </Formik>
  );
};

export default FeedbackForm;

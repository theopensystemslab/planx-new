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
import { Link } from "@mui/material";

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
          Do not share personal or financial information in your feedback. If
          you do we’ll act according to our{" "}
          <Link
            href="https://www.planx.uk/privacy"
            target="_blank"
            rel="noopener"
          >
            privacy policy
          </Link>
          .
        </FeedbackDisclaimer>
        <FormInputs inputs={inputs} />
        <FeedbackDisclaimer>
          This information is not monitored frequently by planning officers, do
          not use it to provide extra information or queries with regard to your
          application or project. Any information of this nature will be
          disregarded.
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

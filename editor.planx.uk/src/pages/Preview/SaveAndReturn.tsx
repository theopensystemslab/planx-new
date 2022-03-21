import Box from "@material-ui/core/Box";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import { object, ref, string } from "yup";

const confirmEmailSchema = object({
  email: string().email("Invalid email").required("Email address required"),
  confirmEmail: string()
    .email("Invalid email")
    .required("Email address required")
    .oneOf([ref("email"), null], "Emails must match"),
});

/**
 *
 * @returns
 */
const ConfirmEmail: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
      confirmEmail: "",
    },
    onSubmit: (values) => {
      useStore.getState().setApplicantEmail(values.confirmEmail);
    },
    validateOnChange: false,
    validationSchema: confirmEmailSchema,
  });

  return (
    <Box width="100%" role="main">
      <Card handleSubmit={formik.handleSubmit}>
        <QuestionHeader
          title="Enter your email address"
          description="We will use this to save your application so you can come back to it later. We will also email you updates about your application."
        ></QuestionHeader>
        <InputRow>
          <InputLabel label={"Email Address"}>
            <Input
              bordered
              errorMessage={
                Boolean(formik.touched.email && formik.errors.email)
                  ? formik.errors.email
                  : undefined
              }
              id="email"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
            ></Input>
          </InputLabel>
        </InputRow>
        <InputRow>
          <InputLabel label={"Confirm Email Address"}>
            <Input
              bordered
              errorMessage={
                Boolean(
                  formik.touched.confirmEmail && formik.errors.confirmEmail
                )
                  ? formik.errors.confirmEmail
                  : undefined
              }
              id="confirmEmail"
              name="confirmEmail"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.confirmEmail}
            ></Input>
          </InputLabel>
        </InputRow>
      </Card>
    </Box>
  );
};

/**
 *
 * @param param0
 * @returns
 */
const SaveAndReturn: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isEmailCaptured = Boolean(useStore((state) => state.applicantEmail));

  return <>{isEmailCaptured ? children : <ConfirmEmail></ConfirmEmail>}</>;
};

export default SaveAndReturn;

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";
import { useMutation } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { downloadApplicationFiles } from "lib/api/submissions/requests";
import startCase from "lodash/startCase.js";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object, string } from "yup";

import { downloadZipFile } from "./helpers/downloadZip";
import { VerifySubmissionEmailProps } from "./types";

const verifySubmissionEmailSchema = object({
  email: string().email("Invalid email").required("Email address required"),
});
export const VerifySubmissionEmail = ({
  params,
}: VerifySubmissionEmailProps): JSX.Element => {
  const { sessionId, team, flow } = params;

  const {
    mutate: getFiles,
    isPending,
    error,
  } = useMutation({
    mutationFn: downloadApplicationFiles,
    onSuccess: (data) =>
      downloadZipFile(data, { filename: `${flow}-${sessionId}.zip` }),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: async (values, { resetForm }) =>
      getFiles(
        {
          sessionId,
          localAuthority: team,
          email: values.email,
        },
        {
          onSettled: resetForm,
        },
      ),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: verifySubmissionEmailSchema,
  });

  return (
    <Container maxWidth="contentWrap">
      <Typography maxWidth="formWrap" variant="h1" pt={5} gutterBottom>
        Download application
      </Typography>
      {isPending ? (
        <DelayedLoadingIndicator />
      ) : (
        <Box width="100%">
          <Card handleSubmit={formik.handleSubmit}>
            <Typography maxWidth="formWrap" variant="h2" gutterBottom>
              Application details
            </Typography>
            <SummaryListTable>
              <Box component="dt">Session ID</Box>
              <Box component="dd">{sessionId}</Box>
              <Box component="dt">Local Authority</Box>
              <Box component="dd">{startCase(team)}</Box>
            </SummaryListTable>
            <ErrorWrapper
              error={
                error
                  ? "Sorry, something went wrong. Please try again"
                  : undefined
              }
            >
              <>
                <CardHeader
                  title="Verify your submission email address"
                  description="This is the submission email set in your team settings. We will use this to confirm that you have access to the submission email inbox that is set up for your team. Entering the correct email address will start the file download automatically."
                />
                <InputRow>
                  <InputLabel
                    label={"Submission email address"}
                    htmlFor={"email"}
                  >
                    <Input
                      bordered
                      errorMessage={
                        formik.touched.email && formik.errors.email
                          ? formik.errors.email
                          : undefined
                      }
                      id="email"
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      value={formik.values.email}
                    />
                  </InputLabel>
                </InputRow>
              </>
            </ErrorWrapper>
          </Card>
        </Box>
      )}
    </Container>
  );
};

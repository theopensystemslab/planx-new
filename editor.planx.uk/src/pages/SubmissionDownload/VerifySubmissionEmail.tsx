import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useQueryClient } from "@tanstack/react-query";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object, string } from "yup";

import { downloadZipFile } from "./helpers/downloadZip";
import useQueryApplicationFileDownload, {
  DOWNLOAD_APPLICATION_FILE_QUERY_KEY,
} from "./queries/useQueryApplicationFileDownload";

const verifySubmissionEmailSchema = object({
  email: string().email("Invalid email").required("Email address required"),
});
interface VerifySubmissionEmailProps {
  params: Record<string, string>;
}

export const VerifySubmissionEmail = ({
  params,
}: VerifySubmissionEmailProps): JSX.Element => {
  const { sessionId, team } = params;
  const [email, setEmail] = useState("");
  const emailInputIsValid = useMemo(() => email !== "", [email]);
  const queryClient = useQueryClient();

  const {
    data: downloadData,
    isLoading,
    isError,
    status: downloadStatus,
  } = useQueryApplicationFileDownload(sessionId, email, team, {
    enabled: emailInputIsValid,
    retry: false,
  });

  const [downloadApplicationError, setDownloadApplicationError] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (downloadData) {
      downloadZipFile(downloadData.data);
    }
  }, [downloadData]);

  useEffect(() => {
    if (isError) {
      setDownloadApplicationError(
        "Sorry, something went wrong. Please try again.",
      );
    } else {
      setDownloadApplicationError(undefined);
    }
  }, [isError]);

  useEffect(() => {
    // if the request has finished, invalidate query cache so other requests can be run
    if (downloadStatus !== "pending") {
      setEmail("");
      queryClient.invalidateQueries({
        queryKey: [`${DOWNLOAD_APPLICATION_FILE_QUERY_KEY}`, sessionId],
      });
    }
  }, [downloadStatus, queryClient, sessionId]);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: (values, { resetForm }) => {
      setEmail(values.email);
      resetForm();
    },
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: verifySubmissionEmailSchema,
  });
  return (
    <Container maxWidth="contentWrap">
      <Typography maxWidth="formWrap" variant="h1" pt={5} gutterBottom>
        Download application
      </Typography>
      {isLoading ? (
        <DelayedLoadingIndicator />
      ) : (
        <Box width="100%">
          <Card handleSubmit={formik.handleSubmit}>
            <ErrorWrapper error={downloadApplicationError}>
              <>
                <CardHeader
                  title="Verify your submission email address"
                  description="We will use this to confirm that you have access to the submission email inbox that is set up for your team. Entering the correct email address will start the file download automatically."
                />
                <InputRow>
                  <InputLabel label={"Email address"} htmlFor={"email"}>
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

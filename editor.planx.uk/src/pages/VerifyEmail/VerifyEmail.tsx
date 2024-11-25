import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useFormik } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object, string } from "yup";

import { downloadZipFile } from "./helpers/downloadZip";
import useQueryApplicationFileDownload from "./queries/useQueryApplicationFileDownload";

const verifyEmailSchema = object({
  email: string().email("Invalid email").required("Email address required"),
});
interface VerifyEmailProps {
  params: Record<string, string>;
}

export const VerifyEmail = ({ params }: VerifyEmailProps): JSX.Element => {
  const { sessionId, team } = params;
  const [email, setEmail] = useState("");
  const emailInputIsValid = useMemo(() => email !== "", [email]);

  const {
    data: downloadData,
    isLoading,
    isError,
    error: downloadError,
  } = useQueryApplicationFileDownload(sessionId, email, team, {
    enabled: emailInputIsValid,
  });

  useEffect(() => {
    if (downloadData) {
      downloadZipFile(downloadData.data); // TODO: fix the typing
    }
  }, [downloadData]);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: (values) => setEmail(values.email),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: verifyEmailSchema,
  });

  return (
    <Container maxWidth="contentWrap">
      <Typography maxWidth="formWrap" variant="h1" pt={5} gutterBottom>
        Download your application
      </Typography>
      // TODO: make error and loading nicer
      {isLoading && <Typography>Loading!</Typography>}
      {isError && (
        <Typography>{`${downloadError} ${downloadError.message}`}</Typography>
      )}
      {
        <Box width="100%">
          <Card handleSubmit={formik.handleSubmit}>
            <CardHeader
              title="Verify your email address"
              description="We will use this to verify that you can download your application. Entering the correct email address will start the file download automatically."
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
          </Card>
        </Box>
      }
    </Container>
  );
};

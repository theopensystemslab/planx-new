import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import axios from "axios";
import { useFormik } from "formik";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { urlWithParams } from "utils";
import { object, string } from "yup";

const verifyEmailSchema = object({
  email: string().email("Invalid email").required("Email address required"),
});

const downloadApplication = async (
  sessionId: string,
  email: string,
  team: string
) => {
  const url = urlWithParams(
    `${
      import.meta.env.VITE_APP_API_URL
    }/download-application-files/${sessionId}`,
    { email, localAuthority: team }
  );

  await axios({
    url,
    method: "GET",
    responseType: "blob",
  }).then((response) => {
    const href = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = href;
    link.setAttribute("download", "application.zip");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  });
};
interface VerifyEmailProps {
  params: Record<string, string>;
}

export const VerifyEmail = ({ params }: VerifyEmailProps): JSX.Element => {
  const { sessionId, team } = params;

  const handleSubmit = async (email: string) => {
    try {
      await downloadApplication(sessionId, email, team);
    } catch (err) {
      console.error(err);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: (values) => handleSubmit(values.email),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: verifyEmailSchema,
  });

  return (
    <Container maxWidth="contentWrap">
      <Typography maxWidth="formWrap" variant="h1" pt={5} gutterBottom>
        Download your application
      </Typography>
      {/* {loading && <Typography>Loading!</Typography>}

      {!loading && ( */}
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
      {/* )} */}
    </Container>
  );
};

import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useFormik } from "formik";
import { publicClient } from "lib/graphql";
import React, { useMemo } from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object, string } from "yup";

import { TEAM_EMAIL_SETTINGS_QUERY } from "./queries/TEAM_EMAIL_SETTINGS_QUERY";

const verifyEmailSchema = object({
  email: string().email("Invalid email").required("Email address required"),
});

interface VerifyEmailProps {
  params: Record<string, string>;
}

export const VerifyEmail = ({ params }: VerifyEmailProps): JSX.Element => {
  const { sessionId, team } = params;

  const { data, error, loading } = useQuery(
    gql`
      ${TEAM_EMAIL_SETTINGS_QUERY}
    `,
    {
      variables: { slug: team },
      client: publicClient,
      skip: !team,
    }
  );

  const teamEmail = useMemo(
    () => data?.teamSettings.submissionEmail || null,
    [data]
  );

  const handleSubmit = (email: string) => {
    if (email === teamEmail) {
      const url = `${process.env.API_URL_EXT}/download-application-files/${sessionId}?email=${teamEmail}&localAuthority=${team}`;
      window.open(url, "_blank");
    } else {
      // handle error
      console.error("wrong email!");
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
      {loading && <Typography>Loading!</Typography>}

      {!loading && (
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
      )}
    </Container>
  );
};

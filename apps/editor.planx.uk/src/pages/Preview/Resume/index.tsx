import Box from "@mui/material/Box";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useCurrentRoute } from "react-navi";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object, string } from "yup";

import SendResumeEmail from "./SendResumeEmail";
import ValidateSession from "./ValidateSession";

export const EmailRequired: React.FC<{
  handleSubmit: (email: string) => void;
}> = ({ handleSubmit }) => {
  const emailSchema = object({
    email: string().email("Invalid email").required("Email address required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: ({ email }) => handleSubmit(email),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: emailSchema,
  });

  return (
    <Box width="100%">
      <Card handleSubmit={formik.handleSubmit}>
        <CardHeader
          title="Resume your form"
          description="Enter your email to resume your form."
        ></CardHeader>
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
              autoComplete="email"
              value={formik.values.email}
            ></Input>
          </InputLabel>
        </InputRow>
      </Card>
    </Box>
  );
};

/**
 * If an email is passed in as a query param, do not prompt a user for this
 *
 * This means there's not an additional step of friction from logging into LPS,
 * or redirecting back from GOV.UK Pay
 *
 * XXX: Won't work locally as referrer is stripped from the browser when navigating from HTTPS to HTTP (localhost)
 */
const getInitialEmailValue = (emailQueryParam?: string) => {
  const trustedAddresses = [
    "https://www.payments.service.gov.uk/",
    "https://card.payments.service.gov.uk/",
    "https://localplanning.editor.planx.dev/",
    "https://www.localplanning.services/",
  ];

  const trustedPatterns = [
    /^https:\/\/localplanning\.\d{4,5}\.planx\.pizza\/$/,
  ];

  const isRedirectFromTrustedSource =
    trustedAddresses.includes(document.referrer) ||
    trustedPatterns.some((pattern) => pattern.test(document.referrer));

  if (isRedirectFromTrustedSource && emailQueryParam) return emailQueryParam;
  return "";
};

/**
 * Component which handles the "Resume" page used for Save & Return
 * The user can access this page via four "paths"
 * 1. Directly via PlanX, user enters email to trigger "dashboard" email with resume magic links
 * 2. Magic link in email with a sessionId, user enters email to continue application
 * 3. Redirect back from GovPay - sessionId and email come from query params
 * 4. Redirect from localplanning.services - sessionId and email come from query params
 */
const ResumePage: React.FC = () => {
  const sessionId = useCurrentRoute().url.query.sessionId;
  const route = useCurrentRoute();

  const [initialEmail] = useState(
    getInitialEmailValue(decodeURIComponent(route.url.query.email)),
  );

  if (sessionId) {
    return (
      <ValidateSession sessionId={sessionId} initialEmail={initialEmail} />
    );
  }

  return <SendResumeEmail initialEmail={initialEmail} />;
};

export default ResumePage;

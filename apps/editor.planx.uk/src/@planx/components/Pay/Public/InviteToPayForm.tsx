import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type {
  PaymentRequest,
  PaymentStatus,
} from "@opensystemslab/planx-core/types";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { usePublicRouteContext } from "hooks/usePublicRouteContext";
import { APIError } from "lib/api/client";
import {
  CreatePaymentRequest,
  generateInviteToPayRequest,
} from "lib/api/inviteToPay/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";
import { object, string } from "yup";

import { getDefaultContent } from "../model";

// Passport keys which will be used to display a preview of the session to the payee as part of their journey
const SESSION_PREVIEW_KEYS = [["_address", "title"], ["proposal.projectType"]];

export interface InviteToPayFormProps {
  changePage: () => void;
  nomineeTitle?: string;
  nomineeDescription?: string;
  yourDetailsTitle?: string;
  yourDetailsDescription?: string;
  yourDetailsLabel?: string;
  paymentStatus?: PaymentStatus;
}

type FormValues = Omit<CreatePaymentRequest, "sessionPreviewKeys">;

const validationSchema = object({
  payeeName: string()
    .trim()
    .required("Enter the full name of the person paying"),
  payeeEmail: string()
    .email(
      "Enter an email address in the correct format, like name@example.com",
    )
    .required("Enter the email address of the person paying"),
  applicantName: string()
    .trim()
    .required("Enter your name or organisation name"),
});

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const SubmitButton: React.FC = () => (
  <Button
    variant="contained"
    color="primary"
    size="large"
    type="submit"
    sx={{ alignSelf: "start" }}
  >
    {"Send invitation to pay"}
  </Button>
);

const InviteToPayForm: React.FC<InviteToPayFormProps> = ({
  changePage,
  nomineeTitle,
  nomineeDescription,
  yourDetailsTitle,
  yourDetailsDescription,
  yourDetailsLabel,
  paymentStatus,
}) => {
  const [sessionId, isTestEnvironment] = useStore((state) => [
    state.sessionId,
    state.hasAcknowledgedWarning,
  ]);
  const navigate = useNavigate();
  const defaults = getDefaultContent();
  const from = usePublicRouteContext();

  const redirectToConfirmationPage = (paymentRequestId: string) => {
    navigate({
      to: "pay/invite",
      from,
      search: { paymentRequestId },
    });
  };

  const {
    mutate: sendITP,
    isError,
    isPending,
  } = useMutation<PaymentRequest, APIError<unknown>, CreatePaymentRequest>({
    mutationKey: ["inviteToPay", sessionId],
    mutationFn: (createPaymentRequest) =>
      generateInviteToPayRequest({ sessionId, ...createPaymentRequest }),
    onSuccess: ({ id }) => redirectToConfirmationPage(id),
  });

  // Scroll to top when loading component
  useEffect(() => window.scrollTo(0, 0), []);

  const formik = useFormik<FormValues>({
    initialValues: {
      payeeName: "",
      payeeEmail: "",
      applicantName: "",
    },
    onSubmit: (values) =>
      sendITP({
        ...values,
        sessionPreviewKeys: SESSION_PREVIEW_KEYS,
      }),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema,
  });

  return isPending ? (
    <DelayedLoadingIndicator />
  ) : (
    <>
      <StyledForm onSubmit={formik.handleSubmit}>
        <Typography variant="h2">{nomineeTitle}</Typography>
        {nomineeDescription && (
          <Typography variant="body2">
            <ReactMarkdownOrHtml
              source={nomineeDescription}
              openLinksOnNewTab
            />
          </Typography>
        )}
        <InputLabel label="Full name" htmlFor="payeeName">
          <Input
            bordered
            name="payeeName"
            id="payeeName"
            value={formik.values.payeeName}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            errorMessage={
              formik.touched.payeeName && formik.errors.payeeName
                ? formik.errors.payeeName
                : undefined
            }
            inputProps={{
              "aria-describedby": "Invite someone else to pay - full name",
            }}
          />
        </InputLabel>
        <InputLabel label="Email" htmlFor="payeeEmail">
          <Input
            bordered
            name="payeeEmail"
            id="payeeEmail"
            value={formik.values.payeeEmail}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            errorMessage={
              formik.touched.payeeEmail && formik.errors.payeeEmail
                ? formik.errors.payeeEmail
                : undefined
            }
            inputProps={{
              "aria-describedby": [
                "Invite someone else to pay - email",
                formik.touched.payeeEmail && formik.errors.payeeEmail
                  ? formik.errors.payeeEmail
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
        </InputLabel>
        <Typography variant="h2" pt={2}>
          {yourDetailsTitle}
        </Typography>
        {yourDetailsDescription && (
          <Typography variant="body2">
            <ReactMarkdownOrHtml
              source={yourDetailsDescription}
              openLinksOnNewTab
            />
          </Typography>
        )}
        <InputLabel
          label={yourDetailsLabel || defaults.yourDetailsLabel}
          htmlFor="applicantName"
        >
          <Input
            bordered
            name="applicantName"
            id="applicantName"
            value={formik.values.applicantName}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            errorMessage={
              formik.touched.applicantName && formik.errors.applicantName
                ? formik.errors.applicantName
                : undefined
            }
            inputProps={{
              "aria-describedby":
                "How should we refer to you in communications with your nominee?",
            }}
          />
        </InputLabel>
        <WarningContainer>
          <ErrorOutline />
          <Typography variant="body2" ml={2} fontWeight="bold">
            Selecting "Send invitation to pay" locks your answers and you'll no
            longer be able to make changes.
          </Typography>
        </WarningContainer>
        {isError ? (
          <ErrorWrapper
            error={
              isTestEnvironment
                ? "Cannot invite to pay within a test environment, please use published service"
                : "Error generating payment request, please try again"
            }
          >
            <SubmitButton />
          </ErrorWrapper>
        ) : (
          <SubmitButton />
        )}
      </StyledForm>
      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2 }}
        size="large"
        onClick={changePage}
        disabled={Boolean(paymentStatus)}
      >
        {"I want to pay myself"}
      </Button>
    </>
  );
};

export default InviteToPayForm;

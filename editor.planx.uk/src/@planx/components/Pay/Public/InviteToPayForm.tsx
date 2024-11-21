import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type {
  KeyPath,
  PaymentRequest,
  PaymentStatus,
} from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import SaveResumeButton from "@planx/components/shared/Preview/SaveResumeButton";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { isPreviewOnlyDomain } from "routes/utils";
import { ApplicationPath } from "types";
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

type CreatePaymentRequest = {
  payeeName: string;
  payeeEmail: string;
  applicantName: string;
  sessionPreviewKeys: Array<KeyPath>;
};

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
  const [sessionId, path] = useStore((state) => [state.sessionId, state.path]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const isSaveReturn = path === ApplicationPath.SaveAndReturn;
  const navigation = useNavigation();
  const {
    data: { mountpath },
  } = useCurrentRoute();

  const defaults = getDefaultContent();

  // Scroll to top when loading component
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const postRequest = async (createPaymentRequest: CreatePaymentRequest) => {
    setIsLoading(true);
    const url = `${
      import.meta.env.VITE_APP_API_URL
    }/invite-to-pay/${sessionId}`;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(createPaymentRequest),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setIsLoading(false);
    if (!response.ok) {
      setError(true);
      throw new Error(
        `Error generating payment request for session ${sessionId}: ${response.body}`,
      );
    }
    return response.json();
  };

  const onSubmit = async (values: FormValues) => {
    const createPaymentRequest: CreatePaymentRequest = {
      ...values,
      sessionPreviewKeys: SESSION_PREVIEW_KEYS,
    };
    try {
      const paymentRequest: PaymentRequest = await postRequest(
        createPaymentRequest,
      );
      if (paymentRequest.id) redirectToConfirmationPage(paymentRequest.id);
    } catch (error) {
      console.error(error);
    }
  };

  const redirectToConfirmationPage = (paymentRequestId: string) => {
    const params = new URLSearchParams({ paymentRequestId }).toString();
    const inviteToPayURL = isPreviewOnlyDomain
      ? `${mountpath}/pay/invite?${params}`
      : `./pay/invite?${params}`;
    navigation.navigate(inviteToPayURL);
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      payeeName: "",
      payeeEmail: "",
      applicantName: "",
    },
    onSubmit: (values) => onSubmit(values),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema,
  });

  return isLoading ? (
    <DelayedLoadingIndicator />
  ) : (
    <Card>
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
              "aria-describedby":
                "Invite someone else to pay for this application - full name",
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
                "Invite someone else to pay for this application - email",
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
        <InputLabel label={yourDetailsLabel || defaults.yourDetailsLabel } htmlFor="applicantName">
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
            Selecting "Send invitation to pay" locks your application and you'll
            no longer be able to make changes.
          </Typography>
        </WarningContainer>
        {error ? (
          <ErrorWrapper
            error={"Error generating payment request, please try again"}
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
        {"I want to pay for this application myself"}
      </Button>
      {isSaveReturn && <SaveResumeButton />}
    </Card>
  );
};

export default InviteToPayForm;

import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { KeyPath, PaymentRequest } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useNavigation } from "react-navi";
import useSWRMutation from "swr/mutation";
import { PaymentStatus } from "types";
import ErrorWrapper from "ui/ErrorWrapper";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";
import { object, string } from "yup";

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
      "Enter an email address in the correct format, like name@example.com"
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
  const sessionId = useStore((state) => state.sessionId);
  const navigation = useNavigation();

  const postRequest = async (
    url: string,
    { arg }: { arg: CreatePaymentRequest }
  ) => {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(arg),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Error generating payment request for session ${sessionId}: ${error}`
      );
    }
    return response.json();
  };

  const { trigger, isMutating, error } = useSWRMutation(
    `${process.env.REACT_APP_API_URL}/invite-to-pay/${sessionId}`,
    postRequest
  );

  const onSubmit = async (values: FormValues) => {
    const createPaymentRequest: CreatePaymentRequest = {
      ...values,
      sessionPreviewKeys: SESSION_PREVIEW_KEYS,
    };
    const paymentRequest: PaymentRequest = await trigger(createPaymentRequest);
    if (!error && paymentRequest.id)
      redirectToConfirmationPage(paymentRequest.id);
  };

  // TODO: This fails in the editor
  // TODO: Test on prod custom domains
  const redirectToConfirmationPage = (paymentRequestId: string) => {
    const params = new URLSearchParams({ paymentRequestId }).toString();
    const inviteToPayURL = `./pay/invite?${params}`;
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

  return isMutating ? (
    <DelayedLoadingIndicator />
  ) : (
    <Card>
      <StyledForm onSubmit={formik.handleSubmit}>
        <Typography variant="h3" component="h2">
          {nomineeTitle}
        </Typography>
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
              Boolean(formik.touched.payeeName && formik.errors.payeeName)
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
              Boolean(formik.touched.payeeEmail && formik.errors.payeeEmail)
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
        <Typography variant="h3" component="h2" pt={2}>
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
        <InputLabel label={yourDetailsLabel || ""} htmlFor="applicantName">
          <Input
            bordered
            name="applicantName"
            id="applicantName"
            value={formik.values.applicantName}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            errorMessage={
              Boolean(
                formik.touched.applicantName && formik.errors.applicantName
              )
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
            Selecting "continue" locks your application and you'll no longer be
            able to make changes.
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
        style={{ borderBottom: `solid 2px lightgrey` }}
        size="large"
        onClick={changePage}
        disabled={Boolean(paymentStatus)}
      >
        {"I want to pay for this application myself"}
      </Button>
      <Typography variant="body2">or</Typography>
      <Link component="button">
        <Typography variant="body2">
          Save and return to this application later
        </Typography>
      </Link>
    </Card>
  );
};

export default InviteToPayForm;

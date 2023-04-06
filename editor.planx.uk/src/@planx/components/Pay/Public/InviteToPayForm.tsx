import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { KeyPath, PaymentRequest } from "@opensystemslab/planx-core";
import Card from "@planx/components/shared/Preview/Card";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import useSWRMutation from "swr/mutation";
import { PaymentStatus } from "types";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";
import { object, string } from "yup";

export interface InviteToPayFormProps {
  changePage: () => void;
  title?: string;
  description?: string;
  paymentStatus?: PaymentStatus;
}

type CreatePaymentRequest = {
  payeeName: string;
  payeeEmail: string;
  sessionPreviewKeys: Array<KeyPath>;
};

type FormValues = Pick<CreatePaymentRequest, "payeeEmail" | "payeeName">;

const validationSchema = object({
  payeeName: string().trim().required("Nominee name required"),
  payeeEmail: string()
    .email(
      "Enter an email address in the correct format, like name@example.com"
    )
    .required("Email address required"),
});

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const InviteToPayForm: React.FC<InviteToPayFormProps> = ({
  changePage,
  title,
  description,
  paymentStatus,
}) => {
  const sessionId = useStore((state) => state.sessionId);
  const route = useCurrentRoute();
  const navigation = useNavigation();

  const postRequest = (url: string, { arg }: { arg: CreatePaymentRequest }) => {
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(arg),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };

  const { trigger, isMutating, error } = useSWRMutation(
    `${process.env.REACT_APP_API_URL}/invite-to-pay/${sessionId}`,
    postRequest
  );

  const onSubmit = async (values: FormValues) => {
    const createPaymentRequest: CreatePaymentRequest = {
      ...values,
      sessionPreviewKeys: [
        ["_address", "title"],
        // ["applicant.agent.name.first"],
        // ["applicant.agent.name.last"],
        // ["proposal.projectType"],
      ],
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
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body2">
        <ReactMarkdownOrHtml source={description} openLinksOnNewTab />
      </Typography>
      <StyledForm onSubmit={formik.handleSubmit}>
        <InputLabel label="Full name (optional)" htmlFor="payeeName">
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
            required
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
        <Button
          variant="contained"
          color="primary"
          size="large"
          type="submit"
          sx={{ alignSelf: "start" }}
        >
          {"Email your nominee"}
        </Button>
      </StyledForm>
      <Typography variant="body2">or</Typography>
      <Link
        component="button"
        onClick={changePage}
        disabled={Boolean(paymentStatus)}
      >
        <Typography variant="body2">
          Pay for this application myself instead
        </Typography>
      </Link>
    </Card>
  );
};

export default InviteToPayForm;

import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { useFormik } from "formik";
import React from "react";
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

const validationSchema = object({
  nomineeName: string().trim().required("Nominee name required"),
  nomineeEmail: string()
    .email(
      "Enter an email address in the correct format, like name@example.com"
    )
    .required("Email address required"),
});

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const InviteToPayForm: React.FC<InviteToPayFormProps> = ({
  changePage,
  title,
  description,
  paymentStatus,
}) => {
  const formik = useFormik({
    initialValues: {
      nomineeName: "",
      nomineeEmail: "",
    },
    onSubmit: (values) => console.log(values),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema,
  });

  return (
    <Card>
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body2">
        <ReactMarkdownOrHtml source={description} openLinksOnNewTab />
      </Typography>
      <StyledForm onSubmit={formik.handleSubmit}>
        <InputLabel label="Full name (optional)" htmlFor="nomineeName">
          <Input
            bordered
            name="nomineeName"
            id="nomineeName"
            value={formik.values.nomineeName}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            errorMessage={
              Boolean(formik.touched.nomineeName && formik.errors.nomineeName)
                ? formik.errors.nomineeName
                : undefined
            }
            inputProps={{
              "aria-describedby":
                "Invite someone else to pay for this application - full name",
            }}
          />
        </InputLabel>
        <InputLabel label="Email" htmlFor="nomineeEmail">
          <Input
            required
            bordered
            name="nomineeEmail"
            id="nomineeEmail"
            value={formik.values.nomineeEmail}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            errorMessage={
              Boolean(formik.touched.nomineeEmail && formik.errors.nomineeEmail)
                ? formik.errors.nomineeEmail
                : undefined
            }
            inputProps={{
              "aria-describedby": [
                "Invite someone else to pay for this application - email",
                formik.touched.nomineeEmail && formik.errors.nomineeEmail
                  ? formik.errors.nomineeEmail
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

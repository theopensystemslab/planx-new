import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { TitleWrapper } from "@planx/components/shared/Preview/CardHeader/styled";
import { useRouteContext } from "@tanstack/react-router";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import Main from "ui/shared/Main";
import { object, ref, string } from "yup";

const confirmEmailSchema = object({
  email: string().email("Invalid email").required("Email address required"),
  confirmEmail: string()
    .email("Invalid email")
    .required("Email address required")
    .oneOf([ref("email"), null], "Emails must match"),
});

export const ConfirmEmail: React.FC<{
  handleSubmit: (email: string) => void;
}> = ({ handleSubmit }) => {
  const formik = useFormik({
    initialValues: {
      email: "",
      confirmEmail: "",
    },
    onSubmit: (values) => handleSubmit(values.confirmEmail),
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: confirmEmailSchema,
  });

  const [flowName, flowSummary] = useStore((state) => [
    state.flowName,
    state.flowSummary,
  ]);

  return (
    <Main>
      <Card handleSubmit={formik.handleSubmit}>
        <CardHeader title={flowName} description={flowSummary}></CardHeader>
        <TitleWrapper>
          <Typography variant="h3" component="h2" role="heading" aria-level={2}>
            {`Enter your email address`}
          </Typography>
        </TitleWrapper>
        <Box
          mb={(theme) => theme.spacing(1)}
          mt={(theme) => theme.spacing(0.75)}
        >
          <Typography variant="subtitle1" component="div">
            {`We will use this to save your form so you can come back to it later. We may also email you updates about it.`}
          </Typography>
        </Box>
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
        <InputRow>
          <InputLabel label={"Confirm email address"} htmlFor={"confirmEmail"}>
            <Input
              bordered
              errorMessage={
                formik.touched.confirmEmail && formik.errors.confirmEmail
                  ? formik.errors.confirmEmail
                  : undefined
              }
              id="confirmEmail"
              name="confirmEmail"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              autoComplete="email"
              value={formik.values.confirmEmail}
            ></Input>
          </InputLabel>
        </InputRow>
      </Card>
    </Main>
  );
};

const SaveAndReturn: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isEmailCaptured = Boolean(useStore((state) => state.saveToEmail));
  const sessionId = useStore((state) => state.sessionId);
  const routeContext = useRouteContext({ strict: false });
  const isContentPage = routeContext?.isContentPage;
  const isViewApplicationPage = routeContext?.isViewApplicationPage;

  // Setting the URL search param "sessionId" will route the user to ApplicationPath.Resume
  // Without this the user will need to click the magic link in their email after a refresh
  const allowResumeOnBrowserRefresh = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("sessionId", sessionId);
    window.history.pushState({}, document.title, url);
  };

  const handleSubmit = (email: string) => {
    useStore.setState({ saveToEmail: email });
    allowResumeOnBrowserRefresh();
  };

  return (
    <>
      {isEmailCaptured || isContentPage || isViewApplicationPage ? (
        children
      ) : (
        <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>
      )}
    </>
  );
};

export default SaveAndReturn;

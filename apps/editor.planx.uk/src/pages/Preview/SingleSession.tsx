import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useCurrentRoute } from "react-navi";
import Main from "ui/shared/Main";

export const Entry: React.FC = () => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: () => console.log("TODO"),
  });

  const [flowName, flowSummary] = useStore((state) => [
    state.flowName,
    state.flowSummary,
  ]);

  return (
    <Main>
      <Card handleSubmit={formik.handleSubmit}>
        <CardHeader title={flowName} description={flowSummary}></CardHeader>
        <Box
          mb={(theme) => theme.spacing(1)}
          mt={(theme) => theme.spacing(0.75)}
        >
          <Typography variant="subtitle1" component="div">
            {`You can leave and come back to this service anytime using the same link, device, and browser.`}
          </Typography>
        </Box>
      </Card>
    </Main>
  );
};

const SingleSession: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isSessionAlreadyInLocalStorage = false; // Boolean(useStore((state) => state.sessionId));
  const isContentPage = useCurrentRoute()?.data?.isContentPage;

  return (
    <>
      {isSessionAlreadyInLocalStorage || isContentPage ? (
        children
      ) : (
        <Entry></Entry>
      )}
    </>
  );
};

export default SingleSession;

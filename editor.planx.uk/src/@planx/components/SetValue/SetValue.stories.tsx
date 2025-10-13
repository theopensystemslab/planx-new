import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Typography from "@mui/material/Typography";
import { Meta } from "@storybook/react";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/SetValue",
  component: Public,
} as Meta;

export const WithEditor = () => {
  return (
    <>
      <Wrapper Editor={Editor} Public={Public} />
      <WarningContainer>
        <ErrorOutline />
        <Typography variant="body2" ml={2}>
          This component is only available in the Editor when designing
          services, it does <strong>not</strong> display in the Public form.
        </Typography>
      </WarningContainer>
    </>
  );
};

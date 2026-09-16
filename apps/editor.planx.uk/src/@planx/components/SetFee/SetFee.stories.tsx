import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import Typography from "@mui/material/Typography";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Meta } from "@storybook/tanstack-react";
import { useId } from "react";

import Wrapper from "../fixtures/Wrapper";
import { WarningContainer } from "../shared/Preview/WarningContainer";
import Editor from "./Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/SetFee",
  component: Public,
} as Meta;

export const WithEditor = () => {
  const warningId = useId();

  return (
    <>
      <Wrapper
        Editor={Editor}
        Public={Public}
        componentType={ComponentType.SetFee}
      />
      <WarningContainer aria-labelledby={warningId}>
        <ErrorOutline />
        <Typography id={warningId} variant="body2" sx={{ ml: 2 }}>
          This component is only available in the Editor when designing
          services, it does <strong>not</strong> display in the Public form.
        </Typography>
      </WarningContainer>
    </>
  );
};

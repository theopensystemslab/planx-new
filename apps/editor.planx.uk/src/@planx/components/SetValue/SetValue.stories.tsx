import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Meta } from "@storybook/tanstack-react";

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
      <Wrapper
        Editor={Editor}
        Public={Public}
        componentType={ComponentType.SetValue}
      />
      <WarningContainer icon={ErrorOutlineOutlined}>
        This component is only available in the Editor when designing services,
        it does <strong>not</strong> display in the Public form.
      </WarningContainer>
    </>
  );
};

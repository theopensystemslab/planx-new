import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Meta } from "@storybook/tanstack-react";
import { useStore } from "pages/FlowEditor/lib/store";
import { WarningContainer } from "ui/shared/WarningContainer/WarningContainer";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor/Editor";
import Public from "./Public";

export default {
  title: "PlanX Components/SetFee",
  component: Public,
} as Meta;

export const WithEditor = () => {
  const { getState, setState } = useStore;
  setState({ teamSettings: { ...getState().teamSettings, contract: "none" } });

  return (
    <>
      <Wrapper
        Editor={Editor}
        Public={Public}
        componentType={ComponentType.SetFee}
      />
      <WarningContainer icon={ErrorOutlineOutlined}>
        This component is only available in the Editor when designing services,
        it does <strong>not</strong> display in the Public form.
      </WarningContainer>
    </>
  );
};

export const WithAutoEnabledServiceCharges = () => {
  const { getState, setState } = useStore;
  setState({
    teamSettings: {
      ...getState().teamSettings,
      contract: "with_sc",
      paymentProvider: "stripe",
    },
  });

  return (
    <>
      <Wrapper
        Editor={Editor}
        Public={Public}
        componentType={ComponentType.SetFee}
      />
      <WarningContainer icon={ErrorOutlineOutlined}>
        This component is only available in the Editor when designing services,
        it does <strong>not</strong> display in the Public form.
      </WarningContainer>
    </>
  );
};

export const WithAutoDisabledServiceCharges = () => {
  const { getState, setState } = useStore;
  setState({
    teamSettings: {
      ...getState().teamSettings,
      contract: "opt_out_sc",
      paymentProvider: "stripe",
    },
  });

  return (
    <>
      <Wrapper
        Editor={Editor}
        Public={Public}
        componentType={ComponentType.SetFee}
      />
      <WarningContainer icon={ErrorOutlineOutlined}>
        This component is only available in the Editor when designing services,
        it does <strong>not</strong> display in the Public form.
      </WarningContainer>
    </>
  );
};

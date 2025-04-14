import { useStore } from "pages/FlowEditor/lib/store";
import { TrialAccountPage } from "pages/TrialAccountPage";
import React, { PropsWithChildren } from "react";

const TrialAccountLayout = ({ children }: PropsWithChildren) => {
  const isTrialAccount = useStore.getState().teamSettings.isTrial;
  if (!isTrialAccount) return children

  return <TrialAccountPage/>
};

export default TrialAccountLayout;

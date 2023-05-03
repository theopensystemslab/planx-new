import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import { useCurrentRoute } from "react-navi";

import { ApplicationPath as AppPath } from "../../types";
import ResumePage from "../Preview/ResumePage";
import SaveAndReturn from "../Preview/SaveAndReturn";
import SavePage from "../Preview/SavePage";

const SaveAndReturnLayout = ({ children }: PropsWithChildren) => {
  const path = useStore((state) => state.path);

  // Manually check for route errors
  // We're not yet within the NaviView which will automatically handle this
  // Save & Return "wrapper" must be resolved first
  const route = useCurrentRoute();
  if (route.error) throw new NotFoundError();

  return (
    <>
      {
        {
          [AppPath.SingleSession]: children,
          [AppPath.Save]: <SavePage />,
          [AppPath.Resume]: <ResumePage />,
          [AppPath.SaveAndReturn]: <SaveAndReturn>{children}</SaveAndReturn>,
        }[path]
      }
    </>
  );
};

export default SaveAndReturnLayout;

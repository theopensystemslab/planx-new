import { useStore } from "pages/FlowEditor/lib/store";
import type { PropsWithChildren } from "react";
import React from "react";

import { ApplicationPath as AppPath } from "../../types";
import ResumePage from "../Preview/Resume";
import SaveAndReturn from "../Preview/SaveAndReturn";
import SavePage from "../Preview/SavePage";

const SaveAndReturnLayout = ({ children }: PropsWithChildren) => {
  const path = useStore((state) => state.path);

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

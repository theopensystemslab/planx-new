import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import Main from "ui/shared/Main";

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
          [AppPath.Save]: (
            <Main>
              <SavePage />
            </Main>
          ),
          [AppPath.Resume]: (
            <Main>
              <ResumePage />
            </Main>
          ),
          [AppPath.SaveAndReturn]: <SaveAndReturn>{children}</SaveAndReturn>,
        }[path]
      }
    </>
  );
};

export default SaveAndReturnLayout;

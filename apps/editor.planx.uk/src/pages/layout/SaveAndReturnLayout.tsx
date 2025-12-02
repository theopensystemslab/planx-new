import { NotFoundError } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren } from "react";
import { useCurrentRoute } from "react-navi";
import Main from "ui/shared/Main";

import { ApplicationPath as AppPath } from "../../types";
import ResumePage from "../Preview/Resume";
import SaveAndReturn from "../Preview/SaveAndReturn";
import SavePage from "../Preview/SavePage";
import SingleSession from "../Preview/SingleSession";

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
          [AppPath.SingleSession]: <SingleSession>{children}</SingleSession>,
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

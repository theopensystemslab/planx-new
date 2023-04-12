import React from "react";

import type { FlowSettings, GlobalSettings } from "../../types";

export const PreviewContext = React.createContext<
  | {
      flowSettings?: FlowSettings;
      globalSettings?: GlobalSettings;
    }
  | undefined
>(undefined);

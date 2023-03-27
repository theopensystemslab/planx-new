import React from "react";

import type { Flow, GlobalSettings } from "../../types";

export const PreviewContext = React.createContext<
  | {
      flow?: Flow;
      globalSettings?: GlobalSettings;
    }
  | undefined
>(undefined);

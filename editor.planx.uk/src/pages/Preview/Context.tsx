import React from "react";

import { Settings } from "../FlowEditor/components/Settings/model";

export interface FlowMetadata {
  id: string;
  team: {
    theme: {
      primary: string;
    };
    settings?: Settings;
  };
}

export const PreviewContext = React.createContext<FlowMetadata | undefined>(
  undefined
);

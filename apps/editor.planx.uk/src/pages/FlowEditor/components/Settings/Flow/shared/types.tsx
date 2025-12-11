import type { TextContent } from "types";

export interface FlowSettings {
  elements?: {
    help: TextContent;
    privacy: TextContent;
    legalDisclaimer: TextContent;
  };
}

export interface GetFlowSettings {
  flow: {
    id: string;
    settings: FlowSettings;
  };
}

export interface UpdateFlowSettings {
  flowId: string;
  settings: FlowSettings;
}

export const DEFAULT_TEXT_CONTENT: TextContent = {
  heading: "",
  content: "",
  show: false,
};

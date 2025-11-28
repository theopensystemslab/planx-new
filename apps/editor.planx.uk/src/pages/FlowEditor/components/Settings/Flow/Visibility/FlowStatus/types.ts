import type { FlowStatus } from "@opensystemslab/planx-core/types";

export interface GetFlowStatus {
  flow: {
    id: string;
    status: FlowStatus;
    hasPrivacyPage: boolean | null;
    team: {
      settings: {
        isTrial: boolean;
      };
    };
    templatedFrom: string | null;
    publishedFlows: {
      id: string;
    }[];
    firstOnlineAt: string | null;
  };
}

export interface FlowStatusFormValues {
  status: FlowStatus;
}

export interface UpdateFlowStatus {
  flowId: string;
  status: FlowStatus;
}

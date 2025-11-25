export type LPSCategory = "apply" | "guidance" | "notify";

export interface LPSListingFormValues {
  isListedOnLPS: boolean;
  summary?: string | null;
  category: LPSCategory | null;
}

export interface GetLPSListingData {
  flow: {
    id: string;
    isListedOnLPS: boolean;
    summary: string | null;
    category: LPSCategory | null;
  };
}

export interface UpdateLPSListingVariables {
  flowId: string;
  isListedOnLPS: boolean;
  category: LPSCategory | null;
}

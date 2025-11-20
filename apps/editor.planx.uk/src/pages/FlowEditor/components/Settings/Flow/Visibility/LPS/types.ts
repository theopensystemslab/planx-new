export interface LPSListingFormValues {
  isListedOnLPS: boolean;
  summary?: string | null;
}

export interface GetLPSListingData {
  flows: {
    id: string;
    isListedOnLPS: boolean;
    summary: string | null;
  }[];
}

export interface UpdateLPSListingVariables {
  flowId: string;
  isListedOnLPS: boolean;
}

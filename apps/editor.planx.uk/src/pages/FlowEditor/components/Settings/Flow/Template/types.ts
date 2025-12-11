export interface GetFlowTemplateStatus {
  flow: {
    name: string;
    templatedFrom: string;
    team: {
      id: number;
      name: string;
    };
    template: {
      id: string;
      name: string;
      team: {
        id: number;
        name: string;
      };
    };
  };
}

export interface FormValues {
  templatedFrom: string | null;
}

export interface EjectFlowFromTemplate {
  flowId: string;
  copiedFrom: string;
}

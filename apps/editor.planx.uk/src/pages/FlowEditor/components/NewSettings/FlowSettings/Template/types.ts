export interface GetFlowTemplateStatus {
  flow: {
    templatedFrom: string;
    template: {
      team: {
        name: string;
      };
    };
  };
}

export interface FormValues {
  templatedFrom?: string | null;
}

export interface EjectFlowFromTemplate {
  flowId: string;
  templatedFrom?: string | null;
}

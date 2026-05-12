export type EmailTemplate = "application" | "general";

export interface GetFlowEmailTemplate {
  flow: {
    id: string;
    email_template: EmailTemplate;
  };
}

export interface UpdateFlowEmailTemplate {
  flowId: string;
  emailTemplate: EmailTemplate;
}

export interface FormValues {
  emailTemplate: EmailTemplate;
}

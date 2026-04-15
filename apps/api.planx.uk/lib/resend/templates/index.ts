import type { WelcomeTemplate } from "./welcome.js";

export type EmailTemplate<
  TTemplateName extends string,
  TVariables extends Record<string, string | number>,
> = {
  id: TTemplateName;
  variables: TVariables;
};

export interface TemplateRegistry {
  welcome: WelcomeTemplate;
}

export type ResendTemplate = keyof TemplateRegistry;

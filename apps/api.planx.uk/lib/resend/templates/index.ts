import { welcomeTemplate } from "./welcome.js";

export interface TemplateParams {
  firstName: string;
  lastName: string;
  email: string;
}

export interface EmailTemplate {
  subject: string;
  html: (params: TemplateParams) => string;
}

export const templateRegistry = {
  welcome: welcomeTemplate,
} as const satisfies Record<string, EmailTemplate>;

export type ResendTemplate = keyof typeof templateRegistry;

import { Page, parsePage } from "../Page/model";

export interface PageWithSections extends Page {
  sections?: Array<any>;
  isValid?: boolean;
}

export const parsePageWithSections = parsePage;

import { Page, parsePage } from "../Page/model";

export interface PageWithSections extends Page {
  sections?: Array<any>;
}

export const parsePageWithSections = parsePage;

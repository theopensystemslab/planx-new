import { BaseNodeData } from "../shared";

export interface Step {
  title: string;
  description: string;
}

export interface Confirmation extends BaseNodeData {
  heading?: string;
  description?: string;
  nextSteps?: Step[];
  moreInfo?: string;
  contactInfo?: string;
}

export const parseNextSteps = (
  data: { [key: string]: any } | undefined,
): { nextSteps: Step[] } => ({
  nextSteps: data?.nextSteps || [],
});

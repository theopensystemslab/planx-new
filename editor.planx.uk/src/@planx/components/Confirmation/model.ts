export interface Step {
  title: string;
  description: string;
}

export interface Confirmation {
  heading?: string;
  description?: string;
  color?: { text: string; background: string };
  details?: { [key: string]: string };
  nextSteps?: Step[];
  moreInfo?: string;
  contactInfo?: { heading?: string; content?: string };
  feedbackCTA?: string;
}

export const parseNextSteps = (
  data: { [key: string]: any } | undefined
): { nextSteps: Step[] } => ({
  nextSteps: data?.nextSteps || [],
});

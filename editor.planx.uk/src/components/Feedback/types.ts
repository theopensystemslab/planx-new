import SvgIcon from "@mui/material/SvgIcon";

export type UserFeedback = {
  userContext?: string;
  userComment: string;
};

export interface FormProps {
  inputs: FeedbackFormInput[];
  handleSubmit: (values: UserFeedback) => void;
}

export type FeedbackFormInput = {
  name: keyof UserFeedback;
  label: string;
  id: string;
};
export type FeedbackCategory =
  | "issue"
  | "idea"
  | "comment"
  | "inaccuracy"
  | "component";
  
export type FeedbackView = "banner" | "triage" | FeedbackCategory | "thanks";
export type ClickEvents = "close" | "back" | "triage" | FeedbackCategory;

export interface TitleAndCloseProps {
  title: string;
  Icon?: typeof SvgIcon;
}

import { Feedback } from "../model";

export const defaultContent: Feedback = {
  title: "Tell us what you think",
  freeformQuestion: "Please tell us more about your experience.",

  ratingQuestion: "How would you rate your experience with this service?",

  description:
    "This service is a work in progress, any feedback you share about your experience will help us to improve it.",

  disclaimer:
    "Please do not include any personal data such as your name, email or address. All feedback is processed according to our privacy notice.",
  feedbackRequired: false,
};

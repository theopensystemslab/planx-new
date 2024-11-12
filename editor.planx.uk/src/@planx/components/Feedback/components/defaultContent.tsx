import { Feedback } from "../model";

export const defaultContent: Feedback = {
  title: "Tell us what you think",
  freeformQuestion:
    "<strong>Please tell us more about your experience.</strong>",

  ratingQuestion:
    "<strong>How would you rate your experience with this service?</strong>",

  description: `This service is a work in progress, any feedback you share about your experience will help us to improve it.
<br>
<br>
Don't share any personal or financial information in your feedback. If you do we will act according to our <a href="">privacy policy</a>.`,

  disclaimer:
    "The information collected here isn't monitored by planning officers. Don't use it to give extra information about your project or submission. If you do, it cannot be used to assess your project.",
  feedbackRequired: false,
};

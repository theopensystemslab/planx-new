export const submitFeedback = (
  text: string,
  metadata?: { [key: string]: any }
) => {
  fetch("https://api.feedback.fish/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: process.env.REACT_APP_FEEDBACK_FISH_ID,
      text,
      metadata,
    }),
  }).catch((err) => console.error(err));
};

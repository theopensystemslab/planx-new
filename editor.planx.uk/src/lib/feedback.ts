export const submitFeedback = (
  feedbackFishId: string,
  text: string,
  metadata?: { [key: string]: any }
) => {
  fetch("https://api.feedback.fish/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: feedbackFishId,
      text,
      metadata,
    }),
  }).catch((err) => console.error(err));
};

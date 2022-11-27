import { useStore } from "pages/FlowEditor/lib/store";

export const submitFeedback = (
  text: string,
  reason: string,
  componentMetadata?: { [key: string]: any }
) => {
  const standardMetadata = getFeedbackMetadata();
  fetch("https://api.feedback.fish/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId: process.env.REACT_APP_FEEDBACK_FISH_ID,
      text,
      reason,
      // FeedbackFish requires that Record<string, string> be passed as metadata
      metadata: {
        ...standardMetadata,
        componentMetadata: JSON.stringify(componentMetadata),
      },
    }),
  }).catch((err) => console.error(err));
};

export const getFeedbackMetadata = (): Record<string, string> => {
  const currentCard = useStore.getState().currentCard();
  const passportData = useStore.getState().computePassport().data;
  const breadcrumbs = useStore.getState().breadcrumbs;
  const [team, service] = window.location.pathname
    .split("/")
    .map((value) => value.replaceAll("-", " "))
    .slice(1, 3);

  const feedbackMetadata = {
    address: passportData?._address?.single_line_address,
    uprn: passportData?._address?.uprn,
    "project-type": passportData?.proposal?.projectType,
    title: currentCard?.data?.title || currentCard?.data?.text,
    data: JSON.stringify(currentCard?.data),
    breadcrumbs: JSON.stringify(breadcrumbs),
    service,
    team,
  };
  return feedbackMetadata;
};

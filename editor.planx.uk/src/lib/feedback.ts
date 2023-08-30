import { useStore } from "pages/FlowEditor/lib/store";

export const submitFeedback = (
  text: string,
  reason: string,
  componentMetadata?: { [key: string]: any },
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
        "component-metadata": JSON.stringify(componentMetadata),
      },
    }),
  }).catch((err) => console.error(err));
};

export const getFeedbackMetadata = (): Record<string, string> => {
  const { currentCard, computePassport, breadcrumbs } = useStore.getState();

  const passportData = computePassport().data;
  const nodeData = currentCard()?.data;

  const [team, service] = window.location.pathname
    .split("/")
    .map((value) => value.replaceAll("-", " "))
    .slice(1, 3);

  const feedbackMetadata = {
    address:
      passportData?._address?.single_line_address ||
      passportData?._address?.title,
    uprn: passportData?._address?.uprn,
    "project-type": passportData?.proposal?.projectType,
    title: nodeData?.title || nodeData?.text,
    data: JSON.stringify(nodeData),
    breadcrumbs: JSON.stringify(breadcrumbs),
    service,
    team,
  };
  return feedbackMetadata;
};

import { useStore } from "pages/FlowEditor/lib/store";
import { useCurrentRoute } from "react-navi";

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

export const getFeedbackMetadata = (): Record<string, string> => {
  const [currentCard, passport] = useStore((state) => [
    state.currentCard(),
    state.computePassport().data,
  ]);
  const { flowName: service, team } = useCurrentRoute().data;

  const feedbackMetadata = {
    address: passport?._address?.single_line_address,
    uprn: passport?._address?.uprn,
    title: currentCard?.data?.title || currentCard?.data?.text,
    data: currentCard?.data,
    service,
    team,
  };
  return feedbackMetadata;
};

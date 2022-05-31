import axios from "axios";
import { getCookie } from "lib/cookie";

export interface HasReviewResponse {
  hasReview: boolean;
  placement: "current" | "parent" | "child";
  slug: string;
}

export { flowHasReview };

async function flowHasReview(
  flowId: string,
  currentNodeId?: string
): Promise<HasReviewResponse> {
  const token = getCookie("jwt");

  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/flows/${flowId}/has-review`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        nodeId: currentNodeId,
      },
    }
  );

  return res.data;
}

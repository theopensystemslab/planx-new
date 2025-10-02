import type { Action } from "@stores/action";

export const actions: Record<Action, { title: string; description: string }> = {
  apply: {
    title: "Start a planning application",
    description:
      "Send a planning application directly to your local planning authority.",
  },
  notify: {
    title: "Notify your authority",
    description:
      "Submit reports, complaints, requests, and notifications directly to your local planning authority.",
  },
  guidance: {
    title: "Get planning guidance",
    description:
      "Find out if you need planning permission, and other guidance services.",
  },
} as const;

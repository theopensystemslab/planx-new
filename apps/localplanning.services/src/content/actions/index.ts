export const ACTIONS = ["apply", "notify", "guidance"] as const;

export type Action = typeof ACTIONS[number];

export const actions: Record<Action, { title: string, description: string }> = {
  apply: {
    title: "Start a planning application",
    description:
      "Send a planning application directly to your local planning authority.",
  },
  notify: {
    title: "Notify your authority",
    description:
      "Inform your local planning authority about changes you think may be a planning breach.",
  },
  guidance:  {
    title: "Get planning guidance",
    description:
      "Find out if you need planning permission, and other guidance services.",
  }
} as const;

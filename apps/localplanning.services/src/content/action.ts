export const ACTIONS = ["apply", "notify", "guidance"] as const;
export type Action = (typeof ACTIONS)[number];

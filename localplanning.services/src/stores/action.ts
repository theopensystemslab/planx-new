import { atom } from "nanostores";

export const ACTIONS = ["apply", "notify", "guidance"] as const;
export type Action = (typeof ACTIONS)[number];

export const $action = atom<Action | null>(null);
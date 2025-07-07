import { atom } from "nanostores";

export type Action = "apply" | "guidance" | "notify"

export const $action = atom<Action | undefined>(undefined);

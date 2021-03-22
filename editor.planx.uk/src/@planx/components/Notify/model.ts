import { MoreInformation } from "../shared";

// XXX: No user data because Notify is a side-effect.
export type UserData = void;

export interface Notify extends MoreInformation {
  token: string;
  templateId: string;
  personalisation: object;
  addressee: string;
}

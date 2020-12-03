import { MoreInformation } from "../shared";

export interface Pay extends MoreInformation {
  title?: string;
  description?: string;
  color?: string;
  fn?: string;
}

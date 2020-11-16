import { MoreInformation } from "../shared";

export interface Notice extends MoreInformation {
  title: string;
  description: string;
  color: string;
  notes?: string;
  resetButton?: boolean;
}

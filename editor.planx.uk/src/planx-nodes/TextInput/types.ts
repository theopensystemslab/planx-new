import { MoreInformation } from "../shared";

export interface TextInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
}

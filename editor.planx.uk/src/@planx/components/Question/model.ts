import { Store } from "pages/FlowEditor/lib/store";
import { HandleSubmit } from "pages/Preview/Node";

export interface Question {
  id?: string;
  text?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
  img?: string;
  responses: {
    id?: string;
    responseKey: string | number;
    title: string;
    description?: string;
    img?: string;
  }[];
  previouslySubmittedData?: Store.UserData;
  handleSubmit: HandleSubmit;
}

import { richText } from "lib/yupExtensions";
import { Store } from "pages/FlowEditor/lib/store";
import { HandleSubmit } from "pages/Preview/Node";
import { object } from "yup";

import { BaseNodeData, baseNodeDataValidationSchema } from "../shared";

export interface Question extends BaseNodeData {
  id?: string;
  text?: string;
  description?: string;
  img?: string;
  neverAutoAnswer?: boolean;
  alwaysAutoAnswerBlank?: boolean;
  responses: {
    id?: string;
    responseKey: string | number;
    title: string;
    description?: string;
    img?: string;
  }[];
  previouslySubmittedData?: Store.UserData;
  handleSubmit: HandleSubmit;
  autoAnswers?: string[] | undefined;
}

export const validationSchema = baseNodeDataValidationSchema.concat(object({
  description: richText(),
}));

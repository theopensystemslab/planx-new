import { richText } from "lib/yupExtensions";
import { string } from "mathjs";
import { array, object, SchemaOf } from "yup";

import { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema } from "./../shared/index";

export interface Step {
  title: string;
  description: string;
}

export interface Confirmation extends BaseNodeData {
  heading?: string;
  description?: string;
  nextSteps?: Step[];
  moreInfo?: string;
  contactInfo?: string;
}

export const parseNextSteps = (
  data: { [key: string]: any } | undefined,
): { nextSteps: Step[] } => ({
  nextSteps: data?.nextSteps || [],
});

export const validationSchema: SchemaOf<Confirmation> =
  baseNodeDataValidationSchema.concat(
    object({
      heading: string(),
      description: richText(),
      moreInfo: richText({ variant: "nestedContent" }),
      contactInfo: richText(),
      nextSteps: array(
        object({
          title: string(),
          description: string(),
        }),
      ),
    }),
  );

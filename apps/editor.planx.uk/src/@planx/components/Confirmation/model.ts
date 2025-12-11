import { richText } from "lib/yupExtensions";
import { string } from "mathjs";
import { array, object, SchemaOf } from "yup";

import { BaseNodeData, parseBaseNodeData } from "../shared";
import { baseNodeDataValidationSchema } from "../shared/index";

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

export const parseConfirmation = (
  data: Record<string, any> | undefined,
): Confirmation => ({
  heading: data?.heading || "Form sent",
  description:
    data?.description ||
    `<p>A payment receipt has been emailed to you. You will also receive an email to confirm when your form has been received.</p>`,
  moreInfo:
    data?.moreInfo ||
    `<h2>You will be contacted</h2>
        <ul>
        <li>if there is anything missing from the information you have provided so far</li>
        <li>if any additional information is required</li>
        <li>to arrange a site visit, if required</li>
        </ul>`,
  contactInfo:
    data?.contactInfo ||
    `You can contact us at <em>ADD YOUR COUNCIL CONTACT</em>
          <br><br>
          <p>What did you think of this service? Please give us your feedback on the next page.</p>`,
  nextSteps: data?.nextSteps || [],
  ...parseBaseNodeData(data),
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

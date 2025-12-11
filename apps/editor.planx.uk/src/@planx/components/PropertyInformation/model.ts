import { richText } from "lib/yupExtensions";
import { boolean, object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface PropertyInformation extends BaseNodeData {
  title: string;
  description?: string;
  showPropertyTypeOverride?: boolean;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): PropertyInformation => ({
  title: data?.title || "About the property",
  description: data?.description || defaultDescription,
  showPropertyTypeOverride: data?.showPropertyTypeOverride || false,
  ...parseBaseNodeData(data),
});

const defaultDescription =
  "<p>This is the information we currently have about the property.</p><p>The blue line shows the outline of the property (known as the title boundary). If this looks incorrect, go back a step and check you have selected the correct address.</p><p>We use this outline to create the site boundary where the project will take place. If your project covers a different area, you can change or redraw the site boundary on the next page.</p>";

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    title: string().required(),
    description: richText(),
    showPropertyTypeOverride: boolean().optional(),
  }),
);

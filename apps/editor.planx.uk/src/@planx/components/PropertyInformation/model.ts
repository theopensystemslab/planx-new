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
  info?: string;
  howMeasured?: string;
  showPropertyTypeOverride?: boolean;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): PropertyInformation => ({
  ...parseBaseNodeData(data),
  title: data?.title || defaultContent["title"],
  description: data?.description || defaultContent["description"],
  info: data?.info || defaultContent["info"],
  howMeasured: data?.howMeasured || defaultContent["howMeasured"],
  showPropertyTypeOverride:
    data?.showPropertyTypeOverride ||
    defaultContent["showPropertyTypeOverride"],
});

// Default content as of February 2026
//   Rather than editing HTML directly here, try updating component directly via editor rich text inputs then running
//   `copy(window.api.getState().flow["{your node id}"].data)` and pasting here
const defaultContent: PropertyInformation = {
  info: "<p>This page shows you the information we currently have about the property. If this looks incorrect, check that you have selected the correct address.</p>",
  title: "About the property",
  description:
    "<p>This is the information we currently have about the property.</p><p>If this looks incorrect, go back a step and <strong>check you have selected the correct address</strong>.</p><p>If the map shows a blue line, that is the outline of the property (known as the title boundary). We use this outline to suggest the site boundary where the project will take place. If your project covers a different area, you can change or redraw the site boundary on the next page.</p>",
  howMeasured:
    '<p><strong>Where do we get this map from?</strong></p><p>The service collects any available mapping information for the address you select. The information available changes when Land Registry update the records.</p><p><strong>What is a title boundary?</strong></p><p>An outline of an area of land belonging to a property.<br>More about <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.gov.uk/your-property-boundaries">your property boundaries</a> on GOV.UK  (opens a new tab).</p>',
  showPropertyTypeOverride: false,
};

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    title: string().required(),
    description: richText(),
    showPropertyTypeOverride: boolean().optional(),
  }),
);
